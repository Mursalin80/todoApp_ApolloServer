const { ApolloError } = require('apollo-server');

module.exports.asyncErrors = function asyncErrors(func) {
  return async (...funcArgs) => {
    try {
      return await func(...funcArgs);
    } catch (error) {
      // re-throw all other errors
      console.log(error);
      throw error;
      // throw new ApolloError(error.message);
    }
  };
};

// module.exports = function translateErrors(func) {
//   return async (...funcArgs) => {
//     try {
//       return await func(...funcArgs);
//     } catch (error) {
//       if (error instanceof UserUnauthenticatedError) {
//         // translate UserUnauthenticatedError into Apollo AuthenticationError
//         const apolloError = new AuthenticationError(error.message);
//         apolloError.originalError = error;
//         throw apolloError;
//       } else if (error instanceof UserUnauthorizedError) {
//         // translate UserUnauthorizedError into Apollo ForbiddenError
//         const apolloError = new ForbiddenError(error.message);
//         apolloError.originalError = error;
//         throw apolloError;
//       } else {
//         // re-throw all other errors
//         throw error;
//       }
//     }
//   };
// };

module.exports.asyncHandler =
  (fn) =>
  (...funcArgs) =>
    Promise.resolve(fn(...funcArgs)).catch((error) => {
      console.log('asyncHandler :', error);
      throw error;
    });
