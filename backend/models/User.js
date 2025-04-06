const bookshelf = require('./bookshelf.js');

const  User = bookshelf.Model.extend({
  tableName: 'users',
  hidden : ['password'],
  subscriptions() {
    return this.hasMany(require('./Subscription'))
  },
  farms() {
    return this.hasMany(require('./Farm'))
  },
  sensors() {
    return this.hasMany(require('./Sensor'))
  },
  notifications() {
    return this.hasMany(require('./Notification'))
  },
  suppliers() {
    return this.belongsTo(require('./Supplier'))
  },
  recommendations(){
    return this.hasMany(require('./Recommendation'))
    
  },
  equipments(){
    return this.hasMany(require('./Equipment'))
    
  },
  plannings(){
    return this.hasMany(require('./Planning'))
    
  },
  datasensors(){
    return this.hasMany(require('./Datasensor'))
    
  },
  simulations(){
    return this.hasMany(require('./Simulation'))
  },
  calculSensors(){
    return this.hasMany(require('./CalculSensor'))

  }
}, 
{

getUserByEmail: function(email) {
    return User.forge().where({"email": email,"is_valid": '1', "is_active": '1'}).fetch({require: false})
          .then(function (user) {
              if(user) {
                  return Promise.resolve(user);
              } else {
                  return Promise.resolve(null);
              }
          });
}        
});

module.exports = User;