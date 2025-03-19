const bookshelf = require('./bookshelf.js');


const  Datasensor = bookshelf.Model.extend({
  tableName: 'datasensor'
});

module.exports = Datasensor;