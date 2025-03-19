const cron = require('node-cron');
const Weather = require('../models/Weather.js');
const Farm = require('../models/Farm.js');
const logger = require('../logs.js');
const fetch = require('node-fetch');
const Field = require('../models/Field.js');
cron.schedule('* * * * *', function() {
    try{
        let date_ob = new Date();
        let dataWeatherToday = [];
        let data = [];
        let idsFarm = [];
            new Field()
            .query((qb) => {
            qb.select('field.Latitude', 'field.Longitude', 'field.id');
            qb.where('field.deleted_at', 'is', null); 
            qb.where('field.Latitude', 'is not', null);
            qb.where('field.Longitude', 'is not', null);
            }).fetchAll()
            .then(async result => {

                data = JSON.parse(JSON.stringify(result));
                
                if(data.length > 0){
                    await data.map(function(positionFarm) {
                        new Weather()
                        .query((qb) => {
                            qb.select('weather_data.lat as Latitude','weather_data.lon as Longitude');
                            qb.where('weather_data.created_at', '=', date_ob.toISOString().slice(0,10));
                            qb.where('weather_data.type', '=', 'day');
                            qb.where('weather_data.lat', '=', positionFarm.Latitude);
                            qb.where('weather_data.lon', '=', positionFarm.Longitude);
                        }).fetchAll()
                        .then(async resultWeather => {
                            dataWeatherToday = JSON.parse(JSON.stringify(resultWeather));
                            if(dataWeatherToday.length == 0){
                                linkApi = process.env.URL_API_OPENWEATHER;
                                const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${positionFarm.Latitude}&lon=${positionFarm.Longitude}&units=metric&appid=482a3988a736d910de52ac8ac007e1ba`);
                                const dataWather = await response.json();
                                new Weather({lat: positionFarm.Latitude, lon: positionFarm.Longitude, data:dataWather, field_id : positionFarm.id,created_at: date_ob, type: 'day'})
                                .save()
                                .then((result) => {
                                    logger.info("--- IDS fields add in weather_data : "+positionFarm.id)
                                }).catch(err => {
                                    logger.fatal("---  field add in weather_data : "+positionFarm.id+" --->"+err)
                                });
                            }
                        }).catch(err => {
                            logger.fatal('**Weather cron** '+ err)
                        });   
                    })   
                }
        }).catch(err => {
            logger.fatal('**Weather cron Select weather today** '+ err)
        });
    }catch(error){
        logger.fatal('**Weather cron** '+ error)
    }

})