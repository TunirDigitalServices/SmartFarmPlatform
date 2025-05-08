const bookshelf = require('./bookshelf.js');


const  Equipment = bookshelf.Model.extend({
  tableName: 'equipment',
  relays() {
    return this.hasMany(require('./Relay'))
  },
});

module.exports = Equipment;