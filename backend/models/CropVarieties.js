const bookshelf = require('./bookshelf.js');

const  CropVarieties = bookshelf.Model.extend({
    tableName: 'crop_variety',
    parse(response) {
      if (response.all_kc) response.all_kc = JSON.parse(response.all_kc)
      return response
    },
    format(attributes) {
      if (attributes.all_kc) attributes.all_kc = JSON.stringify(attributes.all_kc)
      return attributes;
    },
  });
  
  module.exports = CropVarieties;