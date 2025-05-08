const bookshelf = require('./bookshelf.js');

const  Irrigation = bookshelf.Model.extend({
    tableName: 'irrigation',    
  });
  
  module.exports = Irrigation;