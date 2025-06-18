const User = require('./../../models/User.js');
const Field = require('./../../models/Field.js');
const Farm = require('../../models/Farm.js');
const fetch = require('node-fetch');
const Cities = require('../../models/Cities');
const Sensor = require('../../models/Sensor.js');

const getFieldsByUser = async (req, res) => {
    let user_uid = req.params.uid;
    try {
        const user = await new User({'uid': user_uid})
        .fetch({withRelated: [{'farms': (qb) => { qb.where('deleted_at', null); }},{'farms.fields': (qb) => { qb.where('deleted_at', null); }},{'farms.fields.crops': (qb) => { qb.where('deleted_at', null); }},{'farms.fields.crops.irrigations': (qb) => { qb.where('deleted_at', null); }},{'farms.fields.crops.croptypes': (qb) => { qb.where('deleted_at', null); }},{'farms.fields.zones': (qb) => { qb.where('deleted_at', null); }},{'farms.fields.zones.crops': (qb) => { qb.where('deleted_at', null); }}], require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_user_field"});
            if(result) return res.status(201).json({ type:"success" ,farms: result.related('farms') });
        });        
    } catch (error) {
        res.status(500).json({ type:"danger", message: "error_user" });
    }
}

const getAllFields = async (req, res) => {
    try {
        const fields = await Field.query((qb) => {
            qb.where('deleted_at', null)
                .whereNotNull('Latitude')
                .whereNotNull('Longitude');
        })
            .fetchAll({
                withRelated: [
                    {
                        'reports': (qb) => qb.where('deleted_at', null).orderBy('id','DESC'),
                    },
                    {
                        'crops.varieties': (qb) => qb.where('deleted_at', null),
                    },
                    {
                        'crops.croptypes': (qb) => qb.where('deleted_at', null),
                    },
                    {
                        'zones': (qb) => qb.where('deleted_at', null),
                    },
                    {
                        'crops.irrigations': (qb) => qb.where('deleted_at', null),
                    }
                ],
            });

            const farms = await Farm.query((qb) => {
                qb.where('deleted_at', null)
                .whereNotNull('Latitude')
                .whereNotNull('Longitude')
            })
                .fetchAll({require: false});
                const sensors = await Sensor.query((qb) => {
                    qb.where('deleted_at', null)
                    .andWhere('synchronized', "1")
                    .whereNotNull('user_id')
                    .whereNotNull('field_id')
                    .whereNotNull('Latitude')
                    .whereNotNull('Longitude')
                })
                    .fetchAll({require: false});

                    const users = await User.query((qb) => {
                        qb.where('deleted_at', null)

                    })
                        .fetchAll({require: false});
        return res.status(201).json({ fields , farms ,sensors,users });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ type: "danger", message: "error_get_farms" });
    }
};


const getFieldById = async (req,res) => {
try {
    const {fieldId} = req.params 

    const field = new Field({'id' : fieldId})
            .query((qb) => qb.where('deleted_at', null).and.whereNotNull('Latitude').and.whereNotNull('Longitude'))
            .fetch({
                withRelated: [
                    { 'sensors': (qb) => { qb.where('deleted_at', null).andWhere('synchronized', "1") } },
                    { 'crops': (qb) => { qb.where('deleted_at', null); } },
                    { 'crops.irrigations': (qb) => { qb.where('deleted_at', null); } },
                    { 'crops.croptypes': (qb) => { qb.where('deleted_at', null); } },
                    { 'crops.varieties': (qb) => { qb.where('deleted_at', null); } },
                    { 'zones': (qb) => { qb.where('deleted_at', null); } }],
                require: false
            })
            .then(async result => {
                if (result === null) return res.status(404).json({ type:"danger", message: "no_field"});
                if(result) return res.status(201).json({ type:"success" ,field: result });
            });      
} catch (error) {
    res.status(500).json({ type:"danger", message: "error_user" });

}

}


const getFieldsByIds = async (req, res) => {
  try {
    const { fieldIds } = req.body; 

    if (!Array.isArray(fieldIds) || fieldIds.length === 0) {
      return res.status(400).json({ type: "danger", message: "No field IDs provided." });
    }

    const fields = await Field.query((qb) => {
      qb.whereIn("id", fieldIds)
       qb.where('deleted_at', null);
        
    }).fetchAll({ require: false });

    return res.status(200).json({
      type: "success",
      fields: fields.toJSON(),
    });
  } catch (error) {
    console.error("❌ Error fetching fields:", error);
    res.status(500).json({ type: "danger", message: "Server error." });
  }
};


const calculSimulation = async (res,req) => {

    const {   DataIrrigations,
        DataCrops,
        ruPratiqueData,
        RUmaxData,
        dosePercentage,
        effPluie,
        effIrrig,
        irrigArea,
        days,
        profondeur,
        startPlantingDate,
        dataCrop,
        rainConfig,
        latField,
        lonField,
        fieldsId,
        codeSensor} = req.body

    let dailyDates = [];
    let dailyET0 = [];
  
    // Fetch daily evapotranspiration data
    await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latField}&longitude=${lonField}&timezone=GMT&daily=et0_fao_evapotranspiration`,
      {}
    )
      .then((response) => response.json())
      .then((jsonData) => {
        dailyDates = jsonData.daily.time;
        dailyET0 = jsonData.daily.et0_fao_evapotranspiration;
      });
  
    // Initialize variables
    let surfaceOccup = 0;
    let flowByTree = 0;
    let sumETC = 0;
    let sumIrrig = 0;
    let sumNbrIrrig = 0;
    let sumRain = 0;
    let elements = [];
  
    let RuInitial = Number(RUmaxData) * Number(profondeur);
    let ruPratique = Number(ruPratiqueData);
    let RuMax = RuInitial;
    let Epuisement_maximal = (RuMax * ruPratique) / 100;
    let RuMin = RuMax - Epuisement_maximal;
    let prevHourlyBilan = RuInitial;
  
    if (
      dataCrop &&
      Object.keys(dataCrop).length > 0 &&
      typeof dataCrop.all_kc !== "undefined" &&
      days > 0 &&
      latField &&
      lonField
    ) {
      // Main loop for each day
      for (let i = 1; i <= days; i++) {
        if (typeof dataCrop.all_kc[i - 1] !== "undefined") {
          let ET0 = 6;
          let date = addDays(startPlantingDate, i - 1);
          let month = date.getMonth();
          let day = date.getDate();
          let year = date.getFullYear();
          let dateET0 = date.toISOString().slice(0, 10);
  
          // Retrieve ET0 for the specific day
          dailyDates.forEach((dayDate, indx) => {
            if (dateET0 === dayDate) {
              ET0 = dailyET0[indx];
            }
          });
  
          // Calculate surface occupied and flow by tree
          if (DataCrops.length > 0) {
            surfaceOccup = DataCrops[0].surface;
          }
          if (DataIrrigations.length > 0) {
            flowByTree = DataIrrigations[0].reduce((acc, value) => acc + Number(value.drippers) * Number(value.flowrate), 0);
          }
  
          // Get rainfall data
          let rainData = getRainData(rainConfig, month, day);
          if (isCurrentWeek(month, day, year)) {
            let sataRainWeather = await getRainFromWeather(latField, lonField);
            rainData = sataRainWeather[getFormattedDate(year, month, day)] || 0;
          }
  
          let Pe = (Number(rainData) * Number(effPluie)) / 100;
          let kcValue = dataCrop.all_kc[i - 1]?.kc || 0;
          let ETC = kcValue * Number(ET0);
  
          let { bilanHydrique, Irrigation, IrrigationNbr, IrrigTime } = calculateIrrigation(
            i,
            Pe,
            ETC,
            RuMax,
            RuMin,
            RuInitial,
            prevHourlyBilan,
            effIrrig,
            surfaceOccup,
            flowByTree
          );
  
          // Update sums
          sumETC += ETC;
          sumRain += rainData;
          sumNbrIrrig += IrrigationNbr;
          sumIrrig += Irrigation;
  
          elements.push({
            RUmax: RuMax,
            RUMin: RuMin,
            days: i,
            date: date,
            bilan: bilanHydrique,
            pe: Pe,
            Etc: ETC,
            ET0: ET0,
            rain: rainData,
            kc: kcValue,
            irrigation: Irrigation,
            irrigationNbr: IrrigationNbr,
            codeSensor: codeSensor,
            irrigationTime: IrrigTime,
          });
  
          prevHourlyBilan = bilanHydrique[bilanHydrique.length - 1].value;
        }
      }
    }
    return res.status(200).json({ type:"success", simulation : elements});

    // return elements;
  };
  
  // Helper functions

  const getRainData = (rainConfig, month, day) => {
    let dayKey = `${month}_${day}_rain`;
    let monthKey = `${month}_rain`;
    return (
      (rainConfig.rainByDay && rainConfig.rainByDay[dayKey]) ||
      (rainConfig.rainByMonth && rainConfig.rainByMonth[monthKey]) ||
      0
    );
  };
  
  const isCurrentWeek = (month, day, year) => {
    let currentDate = new Date();
    let dateCurrent = currentDate.getDate();
    currentDate.setDate(currentDate.getDate() + 7);
    return currentDate.getMonth() === month && day >= dateCurrent && day < currentDate.getDate() && year === currentDate.getFullYear();
  };
  
  const getFormattedDate = (year, month, day) => {
    return `${year}-${('0' + (month + 1)).slice(-2)}-${('0' + day).slice(-2)}`;
  };
  
  const calculateIrrigation = (i, Pe, ETC, RuMax, RuMin, RuInitial, prevHourlyBilan, effIrrig, surfaceOccup, flowByTree) => {
    let bilanHydrique = [];
    let Irrigation = 0;
    let IrrigationNbr = 0;
    let IrrigTime = 0;
    let formule = (prevHourlyBilan + Pe) - ETC;
    let formuleIrrig = (RuMax - RuMin) / (effIrrig / 100);
    let prevResultBilan = i > 1 ? prevHourlyBilan : RuInitial;
  
    for (let hour = 0; hour < 24; hour++) {
      let hourlyETC = ETC / 24;
      let hourlyBilanValue = (prevResultBilan + Pe / 24) - hourlyETC;
  
      if (hourlyBilanValue <= RuMin) {
        Irrigation = formuleIrrig;
        hourlyBilanValue = RuMax;
        IrrigationNbr = 1;
        IrrigTime = Irrigation / (flowByTree / surfaceOccup) ;
      }
  
      hourlyBilanValue = Math.min(hourlyBilanValue, RuMax);
      bilanHydrique.push({ hour: hour, value: hourlyBilanValue });
  
      prevResultBilan = hourlyBilanValue;
    }
  
    return { bilanHydrique, Irrigation, IrrigationNbr, IrrigTime };
  };
  


const getRainFromConfig = async (city_id) => {
    let dataWeather = {};
    const citiesWeather = await new Citiesweather({ 'city_id': city_id, deleted_at: null })

        .fetch({ require: false })
        .then(async result => {
            if (result) {
                dataWeather = JSON.parse(JSON.stringify(result));
            }
        }).catch(error => {
            return res.status(500).json({ type: "danger", message: "error_city" });

        })
    let weatherByDay = dataWeather.weather_data_days
    let weatherByMonth = dataWeather.weather_data

    let rainByDay = {}
    if (weatherByDay) {
        rainByDay = Object.values(weatherByDay)[2]
    }
    let rainByMonth = {};
    if (weatherByMonth) {
        rainByMonth = Object.values(weatherByMonth)[2]
    }

    return { rainByDay, rainByMonth };
}

const getRainFromWeather = async (lat, lon) => {
    let rain = [];
    const linkApi = process.env.URL_API_OPENWEATHER_FORECAST;
    const response = await fetch(`${linkApi}?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.KEY_OPENWEATHER}`);
    const data = await response.json();
    let list = data.list
    if (typeof list !== 'undefined') {
        list.map(async (weather) => {
            let date = weather.dt_txt.substr(0, 10);
            if (typeof weather.rain !== 'undefined') {
                rain.push({ "date": date, "rain": weather.rain['3h'] });
            }

        })
        var r = rain.reduce(function (pv, cv) {
            if (pv[cv.date]) {
                pv[cv.date] += cv.rain;
            } else {
                pv[cv.date] = cv.rain;
            }
            return pv;
        }, {});

        return r;
    } else {
        return [];
    }

}

module.exports = {getFieldsByUser,getAllFields , getFieldById , calculSimulation,getFieldsByIds}