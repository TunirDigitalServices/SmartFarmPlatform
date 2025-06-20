const bookshelf = require('./bookshelf.js');

const  Crop = bookshelf.Model.extend({
    tableName: 'crop',
     parse(response) {
    if (response.all_kc) response.all_kc = JSON.parse(response.all_kc);
    return response;
  },
  format(attributes) {
    if (attributes.all_kc)
      attributes.all_kc = JSON.stringify(attributes.all_kc);
    return attributes;
  },
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