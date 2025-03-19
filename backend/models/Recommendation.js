const bookshelf = require('./bookshelf.js');


const  Recommendation = bookshelf.Model.extend({
  tableName: 'recommendation'
});

module.exports = Recommendation;