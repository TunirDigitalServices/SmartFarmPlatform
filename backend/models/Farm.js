const bookshelf = require('./bookshelf.js');

const Farm = bookshelf.Model.extend({
  tableName: 'farm',
  fields() {
    return this.hasMany(require('./Field'))
  },
  equipments() {
    return this.belongsTo(require('./Equipment'))

  },
  user() {
    return this.belongsTo(require('./User'));
  },

  city() {
     return this.belongsTo(require('./Cities.js'), 'city_id');
  }



});

module.exports = Farm;