const bookshelf = require('./bookshelf.js');

const  Irrigation = bookshelf.Model.extend({
    tableName: 'irrigation',    
     crop() {
    return this.belongsTo(require('./Crop'), 'crop_id');
  }
  });
  
  module.exports = Irrigation;