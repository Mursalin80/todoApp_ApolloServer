const { RESTDataSource } = require('apollo-datasource-rest');

class TypeCodeAPI extends RESTDataSource {
  constructor() {
    // Always call super()
    super();
    // Sets the base URL for the REST API
    this.baseURL = 'https://jsonplaceholder.typicode.com/';
  }

  async getUser(id) {
    // Send a GET request to the specified endpoint
    return await this.get(`users/${id}`);
  }

  async getUsers() {
    return await this.get('users');
  }
}

module.exports = TypeCodeAPI;
