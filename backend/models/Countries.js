const bookshelf = require('./bookshelf.js');

const  Countries = bookshelf.Model.extend({


    tableName: 'countries',
    cities() {
      return this.hasMany(require('./Cities'))
    },

  });
  
  module.exports = Countries;