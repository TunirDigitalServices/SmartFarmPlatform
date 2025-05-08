const bookshelf = require('./bookshelf.js');

const  Crop = bookshelf.Model.extend({
    tableName: 'crop',
    irrigations() {
      return this.hasMany(require('./Irrigations'))

    },   
    croptypes() {
      return this.belongsTo(require('./Croptype'))

    },
    varieties() {
      return this.belongsTo(require('./CropVarieties'))

    }          

  });
  
  module.exports = Crop;