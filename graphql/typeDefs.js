const { gql } = require('apollo-server');

const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }

  type User {
    id: ID
    name: String!
    email: String!
    state: String!
    DOB: String
    todos: [Todo]
    createdAt: String
    updatedAT: String
  }

  input userInput {
    name: String!
    email: String!
    state: String
    DOB: String
  }

  type Todo {
    id: ID
    title: String!
    description: String!
    auther: User
    createdAt: String
    updatedAT: String
  }

  input todoInput {
    title: String
    description: String
    auther: ID
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
    user: [User]
    todos: [Todo]
    me: User
  }

  type Mutation {
    #   adding Book
    addBook(title: String, author: String): Book

    #    addding User
    addUser(input: userInput): User

    #  adding todo
    addTodo(input: todoInput): Todo
  }
`;

module.exports = typeDefs;
