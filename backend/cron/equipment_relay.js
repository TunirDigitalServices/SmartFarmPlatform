const cron = require('node-cron');
const Equipment = require('../models/Equipment.js');
const Relays = require('../models/Relay.js');
const RelaysTime = require('../models/Timerelay.js');
const User = require('../models/User.js');
const knex = require('../knex/knex.js');
const logger = require('../logs.js');
const sendToUse = require('../services/sendMail.js');

// Schedule tasks to be run on the server.
//running a task every day 10:00:00
//cron.schedule('00 00 10 * * *', function() {

////running a task every 10 second
cron.schedule('*/5 * * * * *', function() {
    try{
        const options = { timeZone: 'Europe/London'};
        
        let date_ob = new Date();
        var currentTime = date_ob.toLocaleTimeString("en-GB", options);
        var current_date = date_ob.toISOString().slice(0,10);
        var day = date_ob.getDay();
        new Equipment()
        .query((qb) => {
          qb.select(
            'relays.port',
            'relays.state',
            'equipment.code',
            'timerelays.id'
            );
          qb.join('relays', 'relays.equipment_id', '=', 'equipment.id');
          qb.join('planning', 'planning.equipment_id', '=', 'equipment.id');
          qb.join('timerelays', 'timerelays.relay_id', '=', 'relays.id');
          qb.where('equipment.deleted_at', 'is', null);
          qb.where('relays.deleted_at', 'is', null);
          qb.where('planning.deleted_at', 'is', null);
          
          qb.where('planning.start_date', '<=', current_date);
          qb.where('planning.end_date', '>=', current_date);
          qb.where('planning.days', 'LIKE', '%'+day+'%');

          qb.where('timerelays.start_time', '<=', currentTime);
          qb.where('timerelays.end_time', '>=', currentTime);
          
        }).fetchAll()
        .then(async result => {
            let data = JSON.parse(JSON.stringify(result));
            //TODO data to send API equipment
            //exemple [ { port: 4, state: '0', code: '212121llll' } ]
            console.log(data)
        }).catch(err => {
            logger.fatal(err)
        }); 
    }catch(error){
        logger.fatal(err)
    }
  });

  //TODO ADD CRON SEND MAIL AND ADD NOTIFICATION BEFORE 3 days END Subscription