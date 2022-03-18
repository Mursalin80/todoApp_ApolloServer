const { makeExecutableSchema } = require('@graphql-tools/schema');
const express = require('express');
const { createServer } = require('http');

const typeDefs = require('../graphql/typeDefs');
const resolvers = require('../graphql/resolvers');
const User = require('../models/user');

const app = express();
const httpServer = createServer(app);
const schema = makeExecutableSchema({ typeDefs, resolvers });

const getDynamicContext = async (ctx, msg, args) => {
  // ctx is the graphql-ws Context where connectionParams live
  if (ctx.connectionParams.authentication) {
    const currentUser = await User.findOne(connectionParams.authentication);
    return { currentUser };
  }
  // Otherwise let our resolvers know we don't have a current user
  return { currentUser: null };
};

module.exports = {
  app,
  httpServer,
  schema,
  getDynamicContext,
};
