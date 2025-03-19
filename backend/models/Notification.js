const bookshelf = require('./bookshelf.js');

const  Notification = bookshelf.Model.extend({
    tableName: 'notification',    
  });
  
  module.exports = Notification;