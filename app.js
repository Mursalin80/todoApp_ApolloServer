// const { ApolloServer } = require('apollo-server-express');
// const express = require('express');
// require('dotenv').config();

// const typeDefs = require('./graphql/typeDefs');
// const resolvers = require('./graphql/resolvers');
// const db = require('./utils/db_connect');
// const TypecodeAPI = require('./apis/typicodeRestApi');

// async function startApolloServer() {
//   const server = new ApolloServer({
//     typeDefs,
//     resolvers,
//     context: ({ req }) => {
//       token = req.headers.authorization?.split(' ')[1] || '';
//       return { token };
//     },
//     dataSources: () => {
//       return {
//         typecodeApi: new TypecodeAPI(),
//       };
//     },
//     formatError: (err) => {
//       // Don't give the specific errors to the client.
//       if (err.message.startsWith('Database Error: ')) {
//         return new Error('Internal server error');
//       }
//       if (err.message.includes('Cast to ObjectId failed')) {
//         return new Error('MongoDB Error: Invalid ID');
//       }
//       // Otherwise return the original error. The error can also
//       // be manipulated in other ways, as long as it's returned.
//       return err;
//     },
//   });
//   await server.start();

//   const app = express();
//   await db.connectDB();

//   // Additional middleware can be mounted at this point to run before Apollo.
//   //   app.use('*', jwtCheck, requireAuth, checkScope);

//   // Mount Apollo middleware here.
//   server.applyMiddleware({ app });
//   await new Promise((resolve) => app.listen({ port: 4000 }, resolve));
//   console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);

//   return { server, app };
// }

// startApolloServer();
