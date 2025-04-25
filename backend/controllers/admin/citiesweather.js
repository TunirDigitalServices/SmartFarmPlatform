const Cities = require('../../models/Cities')
const Citiesweather = require('../../models/Citiesweather')


const addCitiesWeather = async (req,res) => {

    const {city_id,weather_data,weather_data_days } = req.body
if(city_id){
    try {
        const cities= await new Cities({"id" : city_id})
        .fetch({require: false})
        .then( async (response )=> {
            if (response === null) return res.status(404).json({ type:"danger", message: "no_city"});
            if(response){
                console.log(city_id)
                await new Citiesweather({city_id,weather_data,weather_data_days}).save()
                .then((result) => {
                    console.log(result)
                    return res.status(201).json({ type:"success", Cities : result });
                }).catch(err => {
                    return res.status(500).json({ type:"danger", message: err });
                });

            }
        })
    } catch (error) {
        res.status(500).json({ type:"danger", message:error });
    }

}

}


const getCitiesWeather = async (req,res) => {

    try {
        const citiesweather = await new Citiesweather({deleted_at : null})
        .fetchAll()
        .then(async data => {
            return res.status(201).json({ data });
        })
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_get_data" });

    }

}





module.exports = { getCitiesWeather,addCitiesWeather }