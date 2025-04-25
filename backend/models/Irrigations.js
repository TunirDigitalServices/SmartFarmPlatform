const bookshelf = require('./bookshelf.js');

const  Irrigation = bookshelf.Model.extend({
    tableName: 'irrigation',   
},
    {
    getIrrigationsByType: function(type) {
      return Irrigation.forge().where('type', 'LIKE', type+'%').fetch({require : false})
            .then(function (irrigation) {
                if(irrigation) {
                    return Promise.resolve(irrigation);
                } else {
                    return Promise.resolve(null);
                }
            });
      }  
  });
  
  module.exports = Irrigation;