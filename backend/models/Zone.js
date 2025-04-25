const bookshelf = require('./bookshelf.js');

const  Zone = bookshelf.Model.extend({
    tableName: 'zone',
    parse(response) {
      if (response.tags) response.depth_data = JSON.parse(response.depth_data)
      return response
    },
    format(attributes) {
      if (attributes.depth_data) attributes.depth_data = JSON.stringify(attributes.depth_data)
      return attributes;
    },
    soiltypes() {
      return this.belongsTo(require('./Soiltype'))

    },
    crops() {
      return this.hasMany(require('./Crop'))
    },
    // initialize(req, res) {
    //   this.on('saving', (model, attrs, options) => {
    //     return new Promise((resolve, reject) => {
    //     new Zone({'field_id': attrs.field_id, deleted_at: null})
    //     .fetch({require: false})
    //     .then(async result => {
    //         if(result){
    //           reject()
    //         } else {
    //           resolve()
    //         }
    //     }).catch(err => {
    //       reject()
    //     });
    //   })

    //   })
    // }   
  });
  
  module.exports = Zone;