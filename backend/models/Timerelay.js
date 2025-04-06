const bookshelf = require('./bookshelf.js');


const  Timerelay = bookshelf.Model.extend({
  tableName: 'timerelays'
});

module.exports = Timerelay;