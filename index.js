const { createServer } = require('http');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const db = require('./utils/db_connect');
const TypecodeAPI = require('./apis/typicodeRestApi');

async function startApolloServer() {
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const app = express();
  const httpServer = createServer(app);

  const wsServer = new WebSocketServer({
    // This is the `httpServer` we created in a previous step.
    server: httpServer,
    // Pass a different path here if your ApolloServer serves at
    // a different path.
    path: '/graphql',
  });

  const serverCleanup = useServer({ schema }, wsServer);

  const server = new ApolloServer({
    schema,
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
    context: ({ req }) => {
      token = req.headers.authorization?.split(' ')[1] || '';
      console.log(token);
      return { token };
    },
    dataSources: () => {
      return {
        typecodeApi: new TypecodeAPI(),
      };
    },
    formatError: (err) => {
      // Don't give the specific errors to the client.
      if (err.message.startsWith('Database Error: ')) {
        return new Error('Internal server error');
      }
      if (err.message.includes('Cast to ObjectId failed')) {
        return new Error('MongoDB Error: Invalid ID');
      }
      return err;
    },
  });

  await server.start();

  server.applyMiddleware({ app });
  const PORT = 4000;
  httpServer.listen(PORT, () => {
    db.connectDB();
    console.log(
      `Server is now running on http://localhost:${PORT}${server.graphqlPath}`
    );
  });
}

startApolloServer();
