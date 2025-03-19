const WeatherCollectData = require('../../models/WeatherCollectData');
const knex = require('../../knex/knex.js');

const getCollectDataWeather = async (req, res) => {
    try {
        await new WeatherCollectData()
        .fetchAll({require: false})
        .then(async result => {
                return res.status(201).json({ type:"success", result: result });
        }).catch(err => {
            return res.status(500).json({ type:"danger", message: 'error_get_data' });
        });;
    } catch (error) {
        return res.status(500).json({ type:"danger", message: error });
    } 
}

const getSearchCollectDataWeather = async (req, res) => {
    const {city , date} = req.body
    try {
        const w = await new WeatherCollectData();
        let query = [];
        if(city != "" && date == ""){
            query = w.query((qb) => {
                qb.select('*');
                qb.where('city','LIKE' ,city+'%' );
            });
        }
        if(date != "" && city == ""){
            query = w.query((qb) => {
                qb.select('*');
                qb.where(knex.raw('DATE_FORMAT(created_at, "%Y-%m-%d")'),'LIKE', date+'%' );
            });
        }
        if(city != "" && date != ""){
            query = w.query((qb) => {
                qb.select('*');
                qb.where({city: city });
                qb.where(knex.raw('DATE_FORMAT(created_at, "%Y-%m-%d")'),'LIKE', date );
            });
        }
        if(city == "" && date == ""){
            query = w.query((qb) => {
                qb.select('*');
            });
        }

        query.fetchAll({require: false})
        .then(async result => {
                return res.status(201).json({ type:"success", result: result });
        }).catch(err => {
            return res.status(500).json({ type:"danger", message: err });
        });;
    } catch (error) {
        return res.status(500).json({ type:"danger", message: error });
    } 
}

module.exports = {getCollectDataWeather, getSearchCollectDataWeather}