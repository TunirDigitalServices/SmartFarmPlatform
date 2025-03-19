const bookshelf = require('./bookshelf.js');

const  Report = bookshelf.Model.extend({
    tableName: 'reports',
  });
  
  module.exports = Report;