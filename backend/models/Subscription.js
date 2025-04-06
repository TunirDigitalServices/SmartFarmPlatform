
const bookshelf = require('./bookshelf.js');


const  Subscription = bookshelf.Model.extend({
  tableName: 'subscription'
});

module.exports = Subscription;
