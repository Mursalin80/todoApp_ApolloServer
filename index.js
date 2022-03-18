const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const { ApolloServer } = require('apollo-server-express');
require('dotenv').config();

const db = require('./utils/db_connect');
const TypecodeAPI = require('./apis/typicodeRestApi');
const { schema, getDynamicContext, app, httpServer } = require('./server/ulit');

const PORT = 4000;

async function startApolloServer() {
  const wsServer = new WebSocketServer({
    // This is the `httpServer` we created in a previous step.
    server: httpServer,
    // Pass a different path here if your ApolloServer serves at
    // a different path.
    path: '/graphql',
  });

  const serverCleanup = useServer(
    {
      schema,
      // Adding a context property lets you add data to your GraphQL operation context
      context: (ctx, msg, args) => {
        // You can define your own function for setting a dynamic context
        // or provide a static value
        return getDynamicContext(ctx, msg, args);
      },
      onConnect: async (ctx) => {
        // Check authentication every time a client connects.
        // if (tokenIsNotValid(ctx.connectionParams)) {
        //   throw new Error('Auth token missing!');
        // }
        console.log('Client connected!');
      },
      onDisconnect(ctx, code, reason) {
        console.log('Client Disconnected!');
      },
    },
    wsServer
  );

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
  httpServer.listen(PORT, () => {
    db.connectDB();
    console.log(
      `Server is now running on http://localhost:${PORT}${server.graphqlPath}`
    );
  });
}

startApolloServer();
