const bookshelf = require('./bookshelf.js');

const  Cities = bookshelf.Model.extend({
    tableName: 'lat_lon_cities',
    citiesWeathers() {
      return this.hasMany(require('./Citiesweather'))
    },
   
  });
  
  module.exports = Cities;