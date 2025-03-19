const bookshelf = require('./bookshelf.js');


const  Relay = bookshelf.Model.extend({
  tableName: 'relays',
  timerelays() {
    return this.hasMany(require('./Timerelay'))
  }
});

module.exports = Relay;