const cron = require('node-cron');
const Subscription = require('../models/Subscription.js');
const Notification = require('../models/Notification.js');
const User = require('../models/User.js');
const knex = require('../knex/knex.js');
const logger = require('../logs.js');
const sendToUse = require('../services/sendMail.js');

// Schedule tasks to be run on the server.
//cron.schedule('*/10 * * * * *', function() { //running a task every 10 second
//running a task every day 04:00:00
cron.schedule('00 00 04 * * *', function() {
    try{
        //TODO fix query
        new Subscription()
        .query((qb) => {
          qb.select(knex.raw('(DATE(end) - INTERVAL 3 DAY), MAX(end) as maxend, id, user_id'));
          qb.where(knex.raw('(DATE(end) - INTERVAL 3 DAY)'), '=', new Date());
          qb.groupBy('user_id');
          qb.orderBy('maxend','DESC');
        }).fetchAll().then(async result => {
            let data = JSON.parse(JSON.stringify(result))
            for(var k in data) {
                await new Notification({ user_id: data[k].user_id, object: 'Subscription' ,description: 'three_days_before_end_subscription', type: 'warning'}).save()
                .then((result) => {
                    logger.info('notification three_days_before_end_subscription '+data[k].user_id);
                }).catch(err => {
                    logger.fatal(err)
                });
            }
        })
    }catch(error){
        logger.fatal(err)
    }
  });