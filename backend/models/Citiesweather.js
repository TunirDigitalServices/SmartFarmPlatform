const bookshelf = require('./bookshelf.js');

const Citiesweather = bookshelf.Model.extend({
    tableName: 'cities_weather',
    parse(response) {
      if (response.weather_data) response.weather_data = JSON.parse(response.weather_data)
      if (response.weather_data_days) response.weather_data_days = JSON.parse(response.weather_data_days)

      return response
    },
    format(attributes) {
      if (attributes.weather_data) attributes.weather_data = JSON.stringify(attributes.weather_data)
      if (attributes.weather_data_days) attributes.weather_data_days = JSON.stringify(attributes.weather_data_days)

      return attributes;
    },
  });
  
  module.exports = Citiesweather;