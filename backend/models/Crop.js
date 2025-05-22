const bookshelf = require('./bookshelf.js');

const  Crop = bookshelf.Model.extend({
    tableName: 'crop',
    field() {
        return this.belongsTo(require("./Field.js")); // field_id is the foreign key in crop table
    },
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