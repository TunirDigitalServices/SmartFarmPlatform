const bookshelf = require('./bookshelf.js');

const  DataMapping = bookshelf.Model.extend({
    tableName: 'data_mapping',
    parse(response) {
      if (response.max) response.max = JSON.parse(response.max)
      if (response.min) response.min = JSON.parse(response.min)
      if (response.date) response.date = JSON.parse(response.date)
      return response
    },
    format(attributes) {
      if (attributes.max) attributes.max = JSON.stringify(attributes.max)
      if (attributes.min) attributes.min = JSON.stringify(attributes.min)
      if (attributes.date) attributes.date = JSON.stringify(attributes.date)
      return attributes;
    }
  });
  
  module.exports = DataMapping;