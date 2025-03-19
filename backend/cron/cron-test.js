const cron = require('node-cron');


const testFunction = () => {
  console.log('Cron job test function executed.');

 };

// cron job to run every minute 
cron.schedule('* * * * *', () => {
  testFunction();
});
