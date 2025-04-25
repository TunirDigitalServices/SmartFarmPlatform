const bookshelf = require('./bookshelf.js');

const  Simulation = bookshelf.Model.extend({
    tableName: 'simulation',
    parse(response) {
      if (response.result) response.result = JSON.parse(response.result)
      if (response.inputs) response.inputs = JSON.parse(response.inputs)

      return response
    },
    format(attributes) {
      if (attributes.result) attributes.result = JSON.stringify(attributes.result)
      if (attributes.inputs) attributes.inputs = JSON.stringify(attributes.inputs)

      return attributes;
    },
  });
  
  module.exports = Simulation;