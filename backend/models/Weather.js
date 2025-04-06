const bookshelf = require('./bookshelf.js');


const  Weather = bookshelf.Model.extend({
  tableName: 'weather_data',
  parse(response) {
    if (response.data) response.data = JSON.parse(response.data)
    return response
  },
  format(attributes) {
    if (attributes.data) attributes.data = JSON.stringify(attributes.data)
    return attributes;
  },
});

module.exports = Weather;