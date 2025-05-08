const bookshelf = require('./bookshelf.js');


const  Planning = bookshelf.Model.extend({
  tableName: 'planning',
  equipments() {
    return this.hasMany(require('./Equipment'))
  },
});

module.exports = Planning;