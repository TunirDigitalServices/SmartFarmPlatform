const Crop = require("../../models/Crop");
const Soil = require("../../models/Zone");
const CropVarieties = require("../../models/CropVarieties");
const Field = require("../../models/Field");
const User = require("../../models/User");
const CalculSensor = require("../../models/CalculSensor");
const { body, validationResult } = require("express-validator");
const Datasensor = require("../../models/Datasensor");
const logger = require("../../logs.js");
const path = require("path");
const fs = require("fs");
const pdf = require("pdf-creator-node");
const options = require("../../reports/options");

const fetch = require("node-fetch");
const Citiesweather = require("../../models/Citiesweather");
const Farm = require("../../models/Farm");
const Recommendation = require("../../models/Recommendation");
const Report = require("../../models/Report");
const DataMapping = require("../../models/DataMapping");
const option1 = require("../../reports/option1");
const Notification = require("../../models/Notification");

const toSqlDate = (inputDate) => {
  const date = new Date(inputDate);
  const dateWithOffest = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );
  return dateWithOffest.toISOString().slice(0, 10);
};
const createReport = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const tomorrow = addDays(today, 1).toISOString().slice(0, 10);
    console.log(today);
    // Fetch active calculations with related data in a single query

    const calculResults = await new CalculSensor()
      .query((qb) => {
        qb.where("deleted_at", null)
          .andWhere("start_date", "<=", today)
          .andWhere("end_date", ">=", tomorrow)
          .limit(100);
      })
      .fetchAll({
        withRelated: [
          {
            sensors: (qb) => {
              qb.where("deleted_at", null)
                .andWhere("synchronized", "1")
                .whereNotNull("Latitude")
                .whereNotNull("Longitude");
            },
          },
          {
            users: (qb) => {
              qb.where("deleted_at", null)
                .andWhere("is_active", "1")
                .andWhere("is_valid", "1");
            },
            "users.farms": (qb) => {
              qb.where("deleted_at", null);
            },
          },
          {
            fields: (qb) => {
              qb.where("deleted_at", null);
            },
            "fields.crops": (qb) => {
              qb.where("deleted_at", null);
            },
            "fields.crops.croptypes": (qb) => {
              qb.where("deleted_at", null);
            },
            "fields.crops.varieties": (qb) => {
              qb.where("deleted_at", null);
            },
            "fields.crops.irrigations": (qb) => {
              qb.where("deleted_at", null);
            },
            "fields.zones": (qb) => {
              qb.where("deleted_at", null);
            },
            "fields.zones.soiltypes": (qb) => {
              qb.where("deleted_at", null);
            },
          },
        ],
        require: false,
      });
    const data = JSON.parse(JSON.stringify(calculResults));
    // Process all calculations in parallel
    await Promise.all(
      data.map(async (dataCalcul) => {
        console.log("Start processing calculation", dataCalcul.id);
        await processCalculation(dataCalcul);
        console.log("Finished processing", dataCalcul.id);
      })
    );

    return res
      .status(200)
      .json({ type: "success", message: "Reports Created Successfully" });
  } catch (error) {
    console.error("Bulletin creation error:", error);
    return res
      .status(500)
      .json({ type: "danger", message: "Error Creating Report" });
  }
};

// Separate function to process each calculation
const processCalculation = async (dataCalcul) => {
  try {
    // Extract field information
    const fieldInfo = extractFieldInfo(dataCalcul);

    // Process calculation results
    const { calcul, bilan, irrigationStats } = processCalculResults(dataCalcul);

    // Format irrigation duration
    const irrigationDuration = formatIrrigationTime(irrigationStats.irrigTime);

    // Generate PDF report
    await generatePDFReport(
      dataCalcul,
      fieldInfo,
      calcul,
      bilan,
      irrigationStats,
      irrigationDuration
    );
  } catch (error) {
    console.error("Error processing calculation:", error);
    throw error; // Propagate error to parent function
  }
};

// Extract field information from calculation data
const extractFieldInfo = (dataCalcul) => {
  const info = {
    cropType: "",
    plantDate: "",
    soilType: "",
    irrigType: "Goutte à goutte", // Default value
    flowrate: "",
    drippersNbr: "",
    pumpFlow: "",
    cropVariety: "-", // Default value
    farm: "",
    userName: "",
    phoneNumber: "",
  };

  // Extract soil type
  if (dataCalcul.fields && dataCalcul.fields.zones) {
    for (const zone of dataCalcul.fields.zones) {
      if (zone.soiltypes && zone.soiltypes.soil) {
        info.soilType = zone.soiltypes.soil;
        break; // Use first valid soil type
      }
    }
  }

  // Extract crop information
  if (dataCalcul.fields.crops && dataCalcul.fields.crops.length > 0) {
    for (const crop of dataCalcul.fields.crops) {
      info.cropType = crop.croptypes.crop || "";
      info.plantDate = crop.growingDate || "";

      if (crop.varieties && crop.varieties.crop_variety) {
        info.cropVariety = crop.varieties.crop_variety;
      }

      // Extract irrigation information
      if (crop.irrigations && crop.irrigations.length > 0) {
        for (const irrig of crop.irrigations) {
          info.irrigType =
            irrig.type === "drip" ? "Goutte à goutte" : irrig.type;
          info.pumpFlow = irrig.pumpFlow || "";
          info.flowrate = irrig.flowrate || "";
          info.drippersNbr = irrig.drippers || "";
          break; // Use first irrigation
        }
      }
    }
  }

  // Extract user information
  if (dataCalcul.users) {
    info.userName = dataCalcul.users.name || "";
    info.phoneNumber = dataCalcul.users.phone_number || "";

    if (dataCalcul.users.farms && dataCalcul.users.farms.length > 0) {
      info.farm = dataCalcul.users.farms[0].name || "";
    }
  }

  return info;
};

// Process calculation results
const processCalculResults = (dataCalcul) => {
  const calcul = [];
  const bilan = [];
  let total = 0;
  const irrigDates = [];
  let irrigNumber = 0;
  let irrigTime = 0;

  const startDate = new Date(dataCalcul.start_date);
  const endDate = new Date(dataCalcul.end_date);

  // Filter results by date and sensor code
  const filteredResult = (dataCalcul.result || []).filter((result) => {
    const resultDate = new Date(result.date).toISOString().slice(0, 10);
    return (
      toSqlDate(startDate) <= resultDate &&
      toSqlDate(endDate) >= resultDate &&
      result.codeSensor === dataCalcul.sensors.code
    );
  });

  // Process filtered results
  if (filteredResult.length > 0) {
    for (let i = 0; i < filteredResult.length - 1; i++) {
      const element = filteredResult[i];
      total += element.irrigation || 0;

      // Add calculation data
      calcul.push({
        ET0: element.ET0,
        kc: element.kc,
        Etc: parseFloat(element.Etc || 0).toFixed(2),
        date: new Date(element.date).toLocaleString().slice(0, 10),
        RUmax: parseFloat(element.RUmax || 0).toFixed(1),
        irrigation: parseFloat(element.irrigation || 0).toFixed(1),
        irrigationTime: parseFloat(element.irrigationTime || 0).toFixed(2),
      });

      // Calculate average bilan value
      if (element.bilan && element.bilan.length > 0) {
        const averageBilanValue =
          element.bilan.reduce(
            (acc, item) => acc + parseFloat(item.value || 0),
            0
          ) / element.bilan.length;

        bilan.push({
          value: parseFloat(averageBilanValue).toFixed(1),
        });
      }
    }
  }

  // Filter out zero irrigation records
  const calculIrrigation = calcul.filter(
    (irrig) => Number(irrig.irrigation) !== 0
  );
  irrigNumber = calculIrrigation.length;

  if (calculIrrigation.length > 0) {
    // Get irrigation time from last irrigation record
    irrigTime = parseFloat(
      calculIrrigation[calculIrrigation.length - 1].irrigationTime || 0
    ).toFixed(0);

    // Collect all irrigation dates
    calculIrrigation.forEach((irrig) => {
      irrigDates.push(irrig.date);
    });
  }

  return {
    calcul,
    bilan,
    irrigationStats: {
      total: parseFloat(total).toFixed(1),
      irrigNumber,
      irrigTime,
      irrigDates,
    },
  };
};

// Format irrigation time (convert minutes to hours and minutes)
const formatIrrigationTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours > 0
    ? `${hours}h${remainingMinutes > 0 ? remainingMinutes + "m" : ""}`
    : `${remainingMinutes}m`;
};
const calculateIrrigation = (
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
) => {
  let bilanHydrique = [];
  let Irrigation = 0;
  let IrrigationNbr = 0;
  let IrrigTime = 0;
  let formule = prevHourlyBilan + Pe - ETC;
  let formuleIrrig = (RuMax - RuMin) / (effIrrig / 100);
  let prevResultBilan = i > 1 ? prevHourlyBilan : RuInitial;
  let pluieArrosage = flowByTree / surfaceOccup;
  for (let hour = 0; hour < 24; hour++) {
    let hourlyETC = ETC / 24;
    let hourlyBilanValue = prevResultBilan + Pe / 24 - hourlyETC;

    if (hourlyBilanValue <= RuMin) {
      Irrigation = formuleIrrig;
      hourlyBilanValue = RuMax;
      IrrigationNbr = 1;
      IrrigTime = (Irrigation / pluieArrosage) * 60;
    }

    hourlyBilanValue = Math.min(hourlyBilanValue, RuMax);
    bilanHydrique.push({ hour: hour, value: hourlyBilanValue });

    prevResultBilan = hourlyBilanValue;
  }

  return { bilanHydrique, Irrigation, IrrigationNbr, IrrigTime, pluieArrosage };
};
// Generate PDF report
const generatePDFReport = async (
  dataCalcul,
  fieldInfo,
  calcul,
  bilan,
  irrigationStats,
  irrigationDuration
) => {
  const startDate = new Date(dataCalcul.start_date);
  const endDate = new Date(dataCalcul.end_date);
  const newStartDate =
    startDate.getDate().toString().padStart(2, "0") +
    "/" +
    (startDate.getMonth() + 1).toString().padStart(2, "0") +
    "/" +
    startDate.getFullYear();
  const newEndDate =
    endDate.getDate().toString().padStart(2, "0") +
    "/" +
    (endDate.getMonth() + 1).toString().padStart(2, "0") +
    "/" +
    endDate.getFullYear();
  const filename = `${dataCalcul.fields.uid}_${toSqlDate(
    startDate
  )}_${toSqlDate(endDate)}_doc.pdf`;

  try {
    // Read HTML template
    const htmlTemplate = await fs.promises.readFile(
      path.join(__dirname, "../../reports/bulletin.html"),
      "utf-8"
    );

    // Create PDF
    const result = await pdf.create(
      {
        html: htmlTemplate,
        data: {
          products: [
            {
              nameFarm: fieldInfo.farm,
              nameField: dataCalcul.fields.name,
              nameUser: fieldInfo.userName,
              phone: fieldInfo.phoneNumber,
              codeSensor: dataCalcul.sensors.code || "-",
              Lat: parseFloat(dataCalcul.sensors.Latitude || 0).toFixed(4),
              Lon: parseFloat(dataCalcul.sensors.Longitude || 0).toFixed(4),
              crop: fieldInfo.cropType,
              irrigtype: fieldInfo.irrigType,
              flowrate: fieldInfo.flowrate,
              drippers: fieldInfo.drippersNbr,
              pumpFlow: fieldInfo.pumpFlow,
              cropVariety: fieldInfo.cropVariety,
              plantDate: new Date(fieldInfo.plantDate).getFullYear(),
              soil: fieldInfo.soilType,
              startDate: newStartDate,
              endDate: newEndDate,

              totalIrrigation: irrigationStats.total,
              irrigNumber: irrigationStats.irrigNumber,
              irrigTime: irrigationDuration,
              irrigDate: irrigationStats.irrigDates,
            },
          ],
          calcul: calcul,
          bilan: bilan,
        },
        path: "./docs/" + filename,
      },
      option1
    );

    // Save report record to database
    if (result) {
      await new Report({
        user_id: dataCalcul.users.id,
        field_id: dataCalcul.fields.id,
        filename: filename,
      }).save();

      // Uncomment when needed:
      // await addNotifWhenCreateBulletin(dataCalcul.users.id);
      // if (fieldInfo.phoneNumber) {
      //     await sendSMStoUsers(
      //         fieldInfo.phoneNumber,
      //         irrigationStats.irrigNumber,
      //         irrigationStats.irrigDates,
      //         irrigationStats.irrigTime
      //     );
      // }
    }

    return result;
  } catch (error) {
    console.error("Error generating PDF report:", error);
    throw error;
  }
};

const addCalculSensorRecommnd = async (user_id, field_id) => {
  let irrigDates = [];
  let irrigTime = 0;
  let irrigNbr = 0;
  try {
    await new CalculSensor()
      .query((qb) => {
        qb.select("*");
        qb.where({ user_id: user_id });
      })
      .fetchAll({ require: false })
      .then(async (result) => {
        let resultCalcul = JSON.parse(JSON.stringify(result));
        let todayDate = new Date();
        let today = todayDate.toISOString().slice(0, 10);
        let filteredResult = [];
        let title = "";
        let description = "";
        resultCalcul.map((calcul) => {
          let startDate = new Date(calcul.start_date)
            .toISOString()
            .slice(0, 10);
          let endDate = new Date(calcul.end_date).toISOString().slice(0, 10);
          let resultCalcul = calcul.result;
          if (today >= startDate && today <= endDate) {
            filteredResult = resultCalcul.filter((result) => {
              let resultDate = new Date(result.date).toISOString().slice(0, 10);
              return startDate <= resultDate && endDate >= resultDate;
            });
          }
        });
        if (filteredResult.length > 0) {
          let calculWithIrrigation = filteredResult.filter((calcul) => {
            let irrig = calcul.irrigationNbr;
            return irrig !== 0;
          });

          irrigNbr = calculWithIrrigation.length;
          calculWithIrrigation.map((irrig) => {
            irrigTime = parseFloat(irrig.irrigationTime).toFixed(0);
          });

          calculWithIrrigation.forEach((irrig) => {
            irrigDates.push(new Date(irrig.date).toISOString().slice(0, 10));
          });
          const minutes = irrigTime % 60;
          const hours = Math.floor(irrigTime);
          let irrigationDuration = `${hours}h`;
          let message = `Il est recommandé de répartir les besoins en eau de votre parcelle sur ${irrigNbr} fois par semaine. Pour la prochaine irrigation, prévoyez les dates suivantes : ${irrigDates.join(
            ", "
          )} pendant ${irrigationDuration} minutes.`;

          if (calculWithIrrigation.length > 0) {
            title = "Irrigate";
            description =
              "Soil water is now less than the refill point ,  Plant water stress can occur if refill status persists";
          } else {
            title = "Don't Irrigate";
            description =
              "Soil water is not expected to fall below the refill point within the next 7 days, even without irrigation";
          }

          await new Recommendation({
            title,
            description,
            message,
            user_id,
            field_id,
          }).save();
        }
      });
  } catch (error) {
    console.log(error);
  }
};

const calculSimulation = async (
  DataIrrigations,
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
  codeSensor
) => {
  let dailyDates = [];
  let dailyET0 = [];

  // Fetch daily evapotranspiration data
  await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latField}&longitude=${lonField}&timezone=GMT&daily=et0_fao_evapotranspiration`,
    {}
  )
    .then((response) => response.json())
    .then((jsonData) => {
      dailyDates = (jsonData.daily && jsonData.daily.time) || undefined;
      dailyET0 =
        (jsonData.daily && jsonData.daily.et0_fao_evapotranspiration) ||
        undefined;
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
        if (dailyDates && dailyET0) {
          dailyDates.forEach((dayDate, indx) => {
            if (dateET0 === dayDate) {
              ET0 = dailyET0[indx];
            }
          });
        }

        // Calculate surface occupied and flow by tree
        if (DataCrops.length > 0) {
          surfaceOccup = DataCrops[0].surface;
        }
        if (DataIrrigations.length > 0) {
          flowByTree = DataIrrigations[0].reduce(
            (acc, value) =>
              acc + Number(value.drippers) * Number(value.flowrate),
            0
          );
        }

        // Get rainfall data
        let rainData = getRainData(rainConfig, month, day);
        if (isCurrentWeek(month, day, year)) {
          let sataRainWeather = await getRainFromWeather(latField, lonField);
          rainData = sataRainWeather[getFormattedDate(year, month, day)] || 0;
        }

        let Pe = (Number(rainData) * Number(effPluie)) / 100;
        let kcValue = dataCrop.all_kc[i - 1].kc || 0;
        let ETC = kcValue * Number(ET0);

        let {
          bilanHydrique,
          Irrigation,
          IrrigationNbr,
          IrrigTime,
          pluieArrosage,
        } = calculateIrrigation(
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
          pluieArrosage: pluieArrosage,
          codeSensor: codeSensor,
          irrigationTime: IrrigTime,
        });

        prevHourlyBilan = bilanHydrique[bilanHydrique.length - 1].value;
      }
    }
  }

  return elements;
};

const isCurrentWeek = (month, day, year) => {
  let currentDate = new Date();
  let dateCurrent = currentDate.getDate();
  currentDate.setDate(currentDate.getDate() + 7);
  return (
    currentDate.getMonth() === month &&
    day >= dateCurrent &&
    day < currentDate.getDate() &&
    year === currentDate.getFullYear()
  );
};

const getFormattedDate = (year, month, day) => {
  return `${year}-${("0" + (month + 1)).slice(-2)}-${("0" + day).slice(-2)}`;
};

const getRainFromConfig = async (city_id) => {
  let dataWeather = {};
  const citiesWeather = await new Citiesweather({
    city_id: city_id,
    deleted_at: null,
  })

    .fetch({ require: false })
    .then(async (result) => {
      if (result) {
        dataWeather = JSON.parse(JSON.stringify(result));
      }
    })
    .catch((error) => {
      return res.status(500).json({ type: "danger", message: "error_city" });
    });
  let weatherByDay = dataWeather.weather_data_days;
  let weatherByMonth = dataWeather.weather_data;

  let rainByDay = {};
  if (weatherByDay) {
    rainByDay = Object.values(weatherByDay)[2];
  }
  let rainByMonth = {};
  if (weatherByMonth) {
    rainByMonth = Object.values(weatherByMonth)[2];
  }

  return { rainByDay, rainByMonth };
};

const getRainFromWeather = async (lat, lon) => {
  let rain = [];
  const linkApi = process.env.URL_API_OPENWEATHER_FORECAST;
  const response = await fetch(
    `${linkApi}?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.KEY_OPENWEATHER}`
  );
  const data = await response.json();
  let list = data.list;
  if (typeof list !== "undefined") {
    list.map(async (weather) => {
      let date = weather.dt_txt.substr(0, 10);
      if (typeof weather.rain !== "undefined") {
        rain.push({ date: date, rain: weather.rain["3h"] });
      }
    });
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
};

const getRainData = (rainConfig, month, day) => {
  if (!rainConfig) {
    // console.log("Rain config is null or undefined, returning default value 0.");
    return 0;
  }

  let dayKey = `${month}_${day}_rain`;
  let monthKey = `${month}_rain`;

  return (
    (rainConfig.rainByDay && rainConfig.rainByDay[dayKey]) ||
    (rainConfig.rainByMonth && rainConfig.rainByMonth[monthKey]) ||
    0
  );
};

const addDays = (date, days) => {
  let result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// cron calcul
const calculSensorBilan = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Check if today is Monday and within allowed time window
    if (!isScheduledExecutionTime()) {
      return res.status(200).json({
        type: "success",
        message:
          "Calculation skipped. Calculations should start on Mondays between 2:00 AM and 3:00 AM.",
      });
    }

    // Fetch fields with related data
    const fields = await fetchFieldsWithRelatedData();

    if (!fields || fields.length === 0) {
      return res.status(404).json({ type: "danger", message: "no_fields" });
    }

    // Process fields in parallel
    await processAllFields(fields);

    return res.status(200).json({ type: "success", message: "ok" });
  } catch (error) {
    console.error("Error in calculBilanHydrique:", error);
    return res.status(500).json({ type: "danger", message: "error_calcul" });
  }
};

/**
 * Check if current time is within the scheduled execution window (Monday between 2-3 AM)
 */
const isScheduledExecutionTime = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const currentHour = today.getHours();

  return dayOfWeek === 1 && currentHour >= 2 && currentHour < 3;
};

/**
 * Fetch all fields with their related data
 */
const fetchFieldsWithRelatedData = async () => {
  try {
    const result = await new Field()
      .query((qb) => {
        qb.where("deleted_at", null)
          .whereNotNull("Latitude")
          .whereNotNull("Longitude");
      })
      .fetchAll({
        withRelated: [
          {
            sensors: (qb) => {
              qb.where("deleted_at", null).andWhere("synchronized", "1");
            },
          },
          {
            crops: (qb) => {
              qb.where("deleted_at", null);
            },
          },
          {
            "crops.irrigations": (qb) => {
              qb.where("deleted_at", null);
            },
          },
          {
            "crops.croptypes": (qb) => {
              qb.where("deleted_at", null);
            },
          },
          {
            "crops.varieties": (qb) => {
              qb.where("deleted_at", null);
            },
          },
          {
            zones: (qb) => {
              qb.where("deleted_at", null);
            },
          },
        ],
        require: false,
      });

    return result ? JSON.parse(JSON.stringify(result)) : null;
  } catch (error) {
    console.error("Error fetching fields:", error);
    throw error;
  }
};

/**
 * Process all fields in parallel
 */
const processAllFields = async (fields) => {
  await Promise.all(
    fields.map(async (field) => {
      await processField(field);
    })
  );
};

/**
 * Process a single field's data
 */

const getUserIdFromFarm = async (farmId) => {
  try {
    if (!farmId) {
      console.warn("Warning: No farmId provided");
      return null;
    }

    console.log(`Fetching user_id for farm ${farmId}`);

    const farm = await new Farm({ id: farmId }).fetch({ require: false });

    const userId = farm ? farm.get("user_id") : null;

    console.log(`Fetched user_id: ${userId} for farm ${farmId}`);

    return userId;
  } catch (error) {
    console.error(`Error fetching farm ${farmId}:`, error);
    return null;
  }
};

const processField = async (field) => {
  try {
    console.log(`Processing field ${field.id} with farm_id: ${field.farm_id}`);

    // Get user_id from farm
    const userId = await getUserIdFromFarm(field.farm_id);
    console.log(`Final user_id for field ${field.id}: ${userId}`);

    // Extract zone data
    const zoneData = extractZoneData(field);

    // Extract crop data
    const {
      dataCrop,
      days,
      profondeur,
      plantingDate,
      ruPratique,
      dosePercentage,
      effIrrig,
    } = await extractCropData(field);
    const cityId = await getCityIdFromFarm(field.farm_id);

    const rainConfig = await getRainFromConfig(cityId);

    const resultCalcul = await calculSimulation(
      field.crops.map((crop) => crop.irrigations).filter(Boolean),
      field.crops,
      ruPratique,
      zoneData.RUmax,
      dosePercentage,
      zoneData.effPluie,
      effIrrig,
      zoneData.irrigArea,
      days,
      profondeur,
      plantingDate,
      dataCrop,
      rainConfig,
      field.Latitude,
      field.Longitude,
      field.id
      // codeSensor
    );

    if (!resultCalcul || !resultCalcul.length) {
      console.warn(`No calculation results for field ${field.id}`);
      return;
    }

    // Prepare calculation inputs
    const inputs = [
      {
        ruPratique,
        RUmax: zoneData.RUmax,
        effPluie: zoneData.effPluie,
        effIrrig,
        irrigArea: zoneData.irrigArea,
        profondeur,
        plantingDate,
      },
    ];
    if (field.sensors && field.sensors.length > 0) {
      await processSensors(
        field,
        dataCrop,
        days,
        profondeur,
        plantingDate,
        ruPratique,
        dosePercentage,
        zoneData,
        effIrrig,
        userId // Pass user_id correctly
      );
    } else {
      console.warn(
        `No sensors for field ${field.id}, proceeding without sensors`
      );

      // Call save calculation even without sensors
      await saveCalculationResults(
        userId, // Ensure user_id is passed correctly
        field.id,
        null, // No sensor
        null, // No sensor code
        resultCalcul, // No calculation results
        inputs
      );

      await addCalculSensorRecommnd(userId, field.id);
    }
  } catch (error) {
    console.error(`Error processing field ${field.id}:`, error);
  }
};

/**
 * Extract zone data from field
 */
const extractZoneData = (field) => {
  const zoneData = {
    RUmax: 0,
    effPluie: 0,
    effIrrig: 0,
    irrigArea: 0,
    ruPratique: 0,
  };

  if (field.zones && field.zones.length > 0) {
    const zone = field.zones[0]; // Use first zone data
    zoneData.RUmax = Number(zone.RUmax) || 0;
    zoneData.effPluie = Number(zone.effPluie) || 0;
    zoneData.effIrrig = Number(zone.effIrrig) || 0;
    zoneData.irrigArea = Number(zone.irrigArea) || 0;
    zoneData.ruPratique = Number(zone.ruPratique) || 0;
  }

  return zoneData;
};

/**
 * Extract crop data from field
 */
const extractCropData = async (field) => {
  const cropData = {
    dataCrop: {},
    days: 0,
    profondeur: 0,
    plantingDate: "",
    ruPratique: 0,
    dosePercentage: 100,
    effIrrig: 0,
    DataIrrigations: [],
  };

  if (field.crops && field.crops.length > 0) {
    // Get first crop
    const crop = field.crops[0];

    // Extract crop data
    cropData.days = Number(crop.days) || 0;
    cropData.profondeur = Number(crop.rootDepth) || 0;
    cropData.plantingDate = crop.plantingDate || "";
    cropData.ruPratique = Number(crop.practical_fraction) || 0;

    // Get crop type or variety data
    cropData.dataCrop = crop.croptypes || {};
    if (crop.varieties && Object.keys(crop.varieties).length > 0) {
      cropData.dataCrop = crop.varieties;
    }

    // Get dose efficiency
    if (crop.dose_efficiency !== undefined && crop.dose_efficiency !== null) {
      cropData.dosePercentage = Number(crop.dose_efficiency);
    }

    // Extract irrigation efficiency
    for (const dataCrop of field.crops) {
      if (dataCrop.irrigations && dataCrop.irrigations.length > 0) {
        for (const irrig of dataCrop.irrigations) {
          if (irrig.effIrrig !== undefined) {
            cropData.effIrrig = Number(irrig.effIrrig);
            break;
          }
        }
      }
    }

    // Collect all irrigations data
    cropData.DataIrrigations = field.crops
      .filter((crop) => crop.irrigations.length > 0)
      .map((crop) => crop.irrigations);
  }

  return cropData;
};

/**
 * Process sensors data and run calculations
 */
const processSensors = async (
  field,
  dataCrop,
  days,
  profondeur,
  plantingDate,
  ruPratique,
  dosePercentage,
  zoneData,
  effIrrig,
  userId
) => {
  // Get city ID for rain configuration
  const cityId = await getCityIdFromFarm(field.farm_id);
  const rainConfig = await getRainFromConfig(cityId);

  // Process each sensor
  await Promise.all(
    field.sensors.map(async (sensor) => {
      await processSensor(
        sensor,
        field,
        dataCrop,
        days,
        profondeur,
        plantingDate,
        ruPratique,
        dosePercentage,
        zoneData,
        effIrrig,
        rainConfig,
        userId
      );
    })
  );
};

/**
 * Get city ID from farm record
 */
const getCityIdFromFarm = async (farmId) => {
  try {
    if (!farmId) return "";

    const farm = await new Farm({ id: farmId }).fetch({ require: false });

    return farm ? farm.get("city_id") : "";
  } catch (error) {
    console.error(`Error fetching farm ${farmId}:`, error);
    return "";
  }
};

/**
 * Process a single sensor
 */
const processSensor = async (
  sensor,
  field,
  dataCrop,
  days,
  profondeur,
  plantingDate,
  ruPratique,
  dosePercentage,
  zoneData,
  effIrrig,
  rainConfig,
  userId // Ensure this is correctly passed
) => {
  try {
    const codeSensor = sensor ? sensor.code : null;

    console.log(
      `Processing sensor ${sensor ? sensor.id : "null"} for field ${
        field.id
      } with user_id: ${userId}`
    );

    if (
      !codeSensor &&
      (!dataCrop ||
        !Object.keys(dataCrop).length ||
        !dataCrop.all_kc ||
        days <= 0 ||
        !field.Latitude ||
        !field.Longitude)
    ) {
      console.warn(
        `Skipping calculation for field ${field.id} due to missing data`
      );
      return;
    }

    // Run simulation calculation
    const resultCalcul = await calculSimulation(
      field.crops.map((crop) => crop.irrigations).filter(Boolean),
      field.crops,
      ruPratique,
      zoneData.RUmax,
      dosePercentage,
      zoneData.effPluie,
      effIrrig,
      zoneData.irrigArea,
      days,
      profondeur,
      plantingDate,
      dataCrop,
      rainConfig,
      field.Latitude,
      field.Longitude,
      field.id,
      codeSensor
    );

    if (!resultCalcul || !resultCalcul.length) {
      console.warn(`No calculation results for field ${field.id}`);
      return;
    }

    // Prepare calculation inputs
    const inputs = [
      {
        ruPratique,
        RUmax: zoneData.RUmax,
        effPluie: zoneData.effPluie,
        effIrrig,
        irrigArea: zoneData.irrigArea,
        profondeur,
        plantingDate,
      },
    ];

    console.log(
      `Saving calculation for field ${field.id}, sensor ${codeSensor}, user ${userId}`
    );

    // Save calculation results
    await saveCalculationResults(
      userId, // Pass the correct user_id
      field.id,
      sensor ? sensor.id : null, // Pass null if no sensor
      codeSensor,
      resultCalcul,
      inputs
    );

    // Add calculation recommendation
    await addCalculSensorRecommnd(userId, field.id);
  } catch (error) {
    console.error(
      `Error processing sensor ${sensor ? sensor.id : "null"} for field ${
        field.id
      }:`,
      error
    );
  }
};

/**
 * Save calculation results to database
 */
const saveCalculationResults = async (
  userId,
  fieldId,
  sensorId,
  sensorCode,
  resultCalcul,
  inputs
) => {
  try {
    console.log(`\n🔍 Saving Calculation for Field ${fieldId}`);
    console.log(`   🆔 User ID: ${userId}`);
    console.log(`   🌾 Field ID: ${fieldId}`);
    console.log(`   📡 Sensor ID: ${sensorId}`);
    console.log(`   📡 Sensor Code: ${sensorCode}`);

    if (!userId) {
      console.warn(
        `⚠️ Warning: user_id is NULL when saving calculation for field ${fieldId}`
      );
    }
    const today = new Date();
    const day = today.getDay(); // 0 (Sun) to 6 (Sat)
    const diffToMonday = (day === 0 ? -6 : 1) - day; // Calculate days to subtract to get Monday

    const start_date = new Date(today);
    start_date.setDate(today.getDate() + diffToMonday);

    const end_date = new Date(start_date);
    end_date.setDate(start_date.getDate() + 7);
    // Ensure user_id is included in the database save
    await new CalculSensor({
      user_id: userId,
      field_id: fieldId,
      sensor_id: sensorId,
      sensor_code: sensorCode,
      start_date ,
      end_date,
      result: resultCalcul,
      inputs: inputs,
    }).save();
  } catch (error) {
    console.error(`❌ Error saving calculation for field ${fieldId}:`, error);
  }
};

module.exports = {
  calculSensorBilan,
  createReport,
};
