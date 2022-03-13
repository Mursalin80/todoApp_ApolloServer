const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const config = require('config');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const mongoose = require('mongoose');

const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  mongoose.connect(process.env.MONGODB_URL).then((cont) => {
    console.log('Mongoose is connected at: ', cont);
  });
  console.log(`🚀  Server ready at ${url}`);
});
