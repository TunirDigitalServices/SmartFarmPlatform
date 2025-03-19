const bookshelf = require('./bookshelf.js');

const  Irrigationtype = bookshelf.Model.extend({
    tableName: 'irrigationtype',    
  });
  
  module.exports = Irrigationtype;