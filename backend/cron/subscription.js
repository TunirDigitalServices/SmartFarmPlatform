const cron = require('node-cron');
const Subscription = require('../models/Subscription.js');
const User = require('../models/User.js');
const knex = require('../knex/knex.js');
const logger = require('../logs.js');
const sendToUse = require('../services/sendMail.js');

// Schedule tasks to be run on the server.
//cron.schedule('*/10 * * * * *', function() { //running a task every 10 second
//running a task every day 10:00:00
cron.schedule('00 00 10 * * *', function() {
    try{
        new Subscription()
        .query((qb) => {
          qb.select('user_id');
          qb.where({ is_active: '1', deleted_at: null });
          qb.where('end', '=', new Date());
          qb.groupBy('user_id');
          qb.orderBy('end','DESC');
        }).fetchAll().then(async result => {
            let data = JSON.parse(JSON.stringify(result))
            for(var k in data) {
                const user = await new User({'id': data[k].user_id, deleted_at: null, is_active: '1', is_valid: '1'})
                .fetch({require: false})
                .then(async result => {
                    if(result != null) {
                        result.set({offer_type: '1'});
                        result.save();
                        //send mail user
                        sendToUse.sendmail(
                            result.get('email'), 
                            'end_subscription',
                            {}
                        );
                        //send admin/commercial app
                        sendToUse.sendmail(
                            process.env.MAIL_ADMIN, 
                            'end_subscription',
                            {name: result.get('name'), email: result.get('email')}
                        );

                    }
                }).catch(err => {
                    logger.fatal(err)
                });
            }
        })
    }catch(error){
        logger.fatal(err)
    }
  });

  //TODO ADD CRON SEND MAIL AND ADD NOTIFICATION BEFORE 3 days END Subscription