const bookshelf = require('./bookshelf.js');

const  Sensor = bookshelf.Model.extend({
    tableName: 'sensor',
    sensorsData() {
      return this.hasMany(require('./Datasensor'))
    },
    dataMapping() {
        return this.hasMany(require('./DataMapping'))
      }
  },
  {

    getSensorByCode: function(code) {
        return Sensor.forge().where('code', 'LIKE', code+'%').fetch({require : false})
              .then(function (sensor) {
                  if(sensor) {
                      return Promise.resolve(sensor);
                  } else {
                      return Promise.resolve(null);
                  }
              });
    }    
});

module.exports = Sensor;