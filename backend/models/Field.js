const bookshelf = require('./bookshelf.js');

const  Field = bookshelf.Model.extend({
  tableName: 'field',
  sensors() {
    return this.hasMany(require('./Sensor'))
  },
  crops() {
    return this.hasMany(require('./Crop'))
  },
  zones() {
    return this.hasMany(require('./Zone'))
  },
  recommendations(){
    return this.hasMany(require('./Recommendation'))
    
  },
  reports(){
    return this.hasMany(require('./Report'))
    
  },       

  events(){
    return this.hasMany(require('./Event'))
    
  } ,  
  farm() {
    return this.belongsTo(require('./Farm'));
  }
});

module.exports = Field;