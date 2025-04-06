const bookshelf = require('./bookshelf.js');


const  Supplier = bookshelf.Model.extend({
  tableName: 'supplier'
});

module.exports = Supplier;