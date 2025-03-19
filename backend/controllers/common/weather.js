const WeatherBd = require('./../../models/Weather.js');

const fetch = require('node-fetch');
const getWeatherData = async (req, res) => {
    //get from api save in table or get from table

        const {lat , lon ,type} = req.body

    try {
        // if(!(req.body.type)){
        //     type = "day";
        // }else {
        //     type = req.body.type;
        // }
        let linkApi = "";
        if(type == "forecast"){
            linkApi = process.env.URL_API_OPENWEATHER_FORECAST;
        }
        if(type == "day"){
            linkApi = process.env.URL_API_OPENWEATHER;
        }
        const Weather = new WeatherBd({'lat': lat, 'lon': lon, created_at: new Date().toISOString().slice(0,10), type: type})
        .fetch({require: false})
        .then(async result => {
            if (result == null && linkApi != "") {
                //get from api and save in db
                const response = await fetch(`${linkApi}?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.KEY_OPENWEATHER}`);
                const data = await response.json();
                await new WeatherBd({ lat: lat, lon: lon, data: data, city: 'ariana', type: type, created_at: new Date().toISOString().slice(0,10)}).save()
                .then((result) => {
                    return res.status(201).json(result);
                }).catch(err => {
                    return res.status(500).json({ type:"danger", message: "error_save_weather_mysql" });
                });
            }
            if(result){
                return res.status(201).json(result);
            }
        }).catch(err => {
            return res.status(500).json({ type:"danger", message: "error_weather_data" });
        });
    } catch (error) {
        return res.status(500).json({ type:"danger", message: error });
    }
}
const addtWeatherDataDB = async (lat, lon, data, city, type) => {
    await new WeatherBd({ lat: lat, lon: lon, data: data, city: city, type: type, created_at: new Date().toISOString().slice(0,10)}).save()
    .then((result) => {
        return result;
    }).catch(err => {
        return 'error';
    });
}

module.exports = {getWeatherData}