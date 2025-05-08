const cron = require('node-cron');
const WeatherCollectData = require('../models/WeatherCollectData.js');
const LatLonCities = require('../models/LatLonCities.js');
const logger = require('../logs.js');
const fetch = require('node-fetch');
cron.schedule('0 8 * * *', function() {
    try{
        let date_ob = new Date();
        let dataWeatherToday = [];
        let data = [];
        let idsFarm = [];
            new LatLonCities()
            .query((qb) => {
            qb.select('lat_lon_cities.lat', 'lat_lon_cities.lon', 'lat_lon_cities.city');
            qb.where('lat_lon_cities.lat', 'is not', null);
            qb.where('lat_lon_cities.lon', 'is not', null);
            qb.where('lat_lon_cities.city', 'is not', null);
            }).fetchAll()
            .then(async result => {
                
                data = JSON.parse(JSON.stringify(result));
               
                if(data.length > 0){
                    await data.map(function(positionCity) {
                        new WeatherCollectData()
                        .query((qb) => {
                            qb.select('weather_collect_data.lat as Latitude','weather_collect_data.lon as Longitude');
                            qb.where('weather_collect_data.created_at', '=', date_ob.toISOString().slice(0,10));
                            qb.where('weather_collect_data.city', '=', positionCity.city);
                            qb.where('weather_collect_data.lat', '=', positionCity.lat);
                            qb.where('weather_collect_data.lon', '=', positionCity.lon);
                        }).fetchAll()
                        .then(async resultWeather => {
                            
                            dataWeatherToday = JSON.parse(JSON.stringify(resultWeather));
                            
                            if(dataWeatherToday.length == 0){
                                let linkApi = process.env.URL_API_OPENWEATHER;
                                const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${positionCity.lat}&lon=${positionCity.lon}&units=metric&appid=482a3988a736d910de52ac8ac007e1ba`);
                                const dataWather = await response.json();
                                new WeatherCollectData({lat: positionCity.lat, lon: positionCity.lon, data:dataWather, created_at: date_ob.toISOString().slice(0,10), city: positionCity.city})
                                .save()
                                .then((result) => {
                                    logger.info("--- IDS farm add in weather_data : "+positionCity.city)
                                }).catch(err => {
                                    logger.fatal("---  farm add in weather_data : "+positionCity.city+" --->"+err)
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