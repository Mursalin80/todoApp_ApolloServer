const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server-express');

module.exports.jwtVerify = (token) => {
  let { id, exp } = jwt.verify(token, process.env.JWT_SECRET);

  if (exp < (new Date().getTime() + 1) / 1000) {
    throw new AuthenticationError('Token has Expired!');
  }
  return id;
};

module.exports.jwtSign = (id) => {
  let token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

  return token;
};
