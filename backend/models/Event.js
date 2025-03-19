const bookshelf = require('./bookshelf.js');


const  Event = bookshelf.Model.extend({
  tableName: 'events'
});

module.exports = Event;