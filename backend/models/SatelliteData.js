const bookshelf = require('./bookshelf.js');


const  SatelliteData = bookshelf.Model.extend({
  tableName: 'satellite_data',
  parse(response) {
    if (response.data) response.data = JSON.parse(response.data)
    if (response.polygon) response.polygon = JSON.parse(response.polygon)

    return response
  },
  format(attributes) {
    if (attributes.data) attributes.data = JSON.stringify(attributes.data)
    if (attributes.polygon) attributes.polygon = JSON.stringify(attributes.polygon)

    return attributes;
  },
});

module.exports = SatelliteData;