const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar Upload
  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }

  type Book {
    title: String
    author: String
  }
  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }

  type Company {
    name: String
    catchPhrase: String
    bs: String
  }
  type Address {
    street: String
    suite: String
    city: String
    zipcode: String
  }

  type restUser {
    id: Int
    name: String
    username: String
    email: String
    phone: String
    website: String
    company: Company
    address: Address
  }

  type User {
    id: ID
    name: String!
    email: String!
    state: String!
    DOB: String
    todos: [Todo]
    token: String
    createdAt: String
    updatedAT: String
  }

  input userInput {
    name: String!
    email: String!
    state: String
    DOB: String
    password: String!
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
  }

  type Token {
    token: String
  }

  input loginInput {
    email: String
    password: String
  }

  type forgetPassword {
    email: String
  }

  input resetPassword {
    token: String
    password: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
    user: [User]
    todos: [Todo]
    me: User
    restUsers: [restUser]
    restUser(id: String): restUser
    forgetPassword(email: String): forgetPassword
  }

  type Mutation {
    #   adding Book
    addBook(title: String, author: String): Book

    #    addding User
    addUser(input: userInput): User

    # login
    login(input: loginInput): Token

    #  adding todo
    addTodo(input: todoInput): Todo

    #  Delet todo
    deleteTodo(id: String): Todo

    # Update Todo
    updateTodo(id: String, input: todoInput): Todo
    resetPassword(input: resetPassword): User
  }
  type Subscription {
    todoCreated: Todo
  }
`;

module.exports = typeDefs;
