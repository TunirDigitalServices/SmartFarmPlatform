const bookshelf = require('./bookshelf.js');

const  CalculSensor = bookshelf.Model.extend({
    tableName: 'calcul_sensor',
    parse(response) {
      if (response.result) response.result = JSON.parse(response.result)
      if (response.inputs) response.inputs = JSON.parse(response.inputs)

      return response
    },
    format(attributes) {
      if (attributes.result) attributes.result = JSON.stringify(attributes.result)
      if (attributes.inputs) attributes.inputs = JSON.stringify(attributes.inputs)

      return attributes;
    },
    fields() {
      return this.belongsTo(require('./Field'))

    },
    sensors() {
      return this.belongsTo(require('./Sensor'))

    }   
    ,
    users() {
      return this.belongsTo(require('./User'))

    }   
  });
  
  module.exports = CalculSensor;