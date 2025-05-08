const bookshelf = require('./bookshelf.js');

const  Soiltype = bookshelf.Model.extend({
    tableName: 'soiltype',
  });
  
  module.exports = Soiltype;