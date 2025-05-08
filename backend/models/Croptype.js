const bookshelf = require('./bookshelf.js');

const  Croptype = bookshelf.Model.extend({
    tableName: 'croptype',
    varieties() {
      return this.hasMany(require('./CropVarieties'))

    } ,
    parse(response) {
      if (response.all_kc) response.all_kc = JSON.parse(response.all_kc)
      return response
    },
    format(attributes) {
      if (attributes.all_kc) attributes.all_kc = JSON.stringify(attributes.all_kc)
      return attributes;
    },


  });
  
  module.exports = Croptype;