const bookshelf = require('./bookshelf.js');

const  Farm = bookshelf.Model.extend({
  tableName: 'farm' ,
  fields() {
    return this.hasMany(require('./Field'))
  },
  equipments(){
    return this.belongsTo(require('./Equipment'))
    
  }      
});

module.exports = Farm;