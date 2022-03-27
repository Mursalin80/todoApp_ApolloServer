const { makeExecutableSchema } = require('@graphql-tools/schema');
const express = require('express');
const { createServer } = require('http');

const typeDefs = require('../graphql/typeDefs');
const resolvers = require('../graphql/resolvers');
const User = require('../models/user');
const TypecodeAPI = require('../apis/typicodeRestApi');

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

const errFormat = (err) => {
  // Don't give the specific errors to the client.
  if (err.message.startsWith('Database Error: ')) {
    return new Error('Internal server error');
  }
  if (err.message.includes('Cast to ObjectId failed')) {
    return new Error('MongoDB Error: Invalid ID');
  }
  return err;
};
const reastApi = () => {
  return {
    typecodeApi: new TypecodeAPI(),
  };
};

module.exports = {
  app,
  httpServer,
  schema,
  getDynamicContext,
  errFormat,
  reastApi,
  express,
};
