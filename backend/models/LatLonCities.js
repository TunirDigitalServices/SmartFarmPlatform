const bookshelf = require('./bookshelf.js');


const  LatLonCities = bookshelf.Model.extend({
  tableName: 'lat_lon_cities'
});

module.exports = LatLonCities;