// const { ApolloServer } = require('apollo-server-express');
// const typeDefs = require('./graphql/typeDefs');
// const resolvers = require('./graphql/resolvers');
// const mongoose = require('mongoose');

// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
//   context: async ({ req }) => {
//     return {
//       myProperty: true,
//     };
//   },
//   formatError: (err) => {
//     // Don't give the specific errors to the client.
//     if (err.message.startsWith('Database Error: ')) {
//       return new Error('Internal server error');
//     }
//     // Otherwise return the original error. The error can also
//     // be manipulated in other ways, as long as it's returned.
//     return err;
//   },
// });

// // The `listen` method launches a web server.
// server.listen().then(({ url }) => {
//   mongoose.connect(process.env.MONGODB_URL).then((cont) => {
//     console.log('Mongoose is connected at: ', cont);
//   });
//   console.log(`🚀  Server ready at ${url}`);
// });
