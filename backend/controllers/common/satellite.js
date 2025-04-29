const User = require("../../models/User.js");
const Field = require("../../models/Field.js");
const SatelliteImage = require("../../models/Satelliteimage.js");
const SatelliteData = require("../../models/SatelliteData.js");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const { log } = require("winston");
const { default: axios } = require("axios");
const { v4: uuidv4 } = require("uuid");
const knex = require("../../knex/knex.js");

const addSatelliteImages = async (req, res) => {
  const { user_uid, field_id, data, polygon } = req.body;
  let userId = "";
  const user = await new User({ uid: user_uid, deleted_at: null })
    .fetch({ require: false })
    .then(async (result) => {
      if (result === null)
        return res
          .status(404)
          .json({ type: "danger", message: "no_user_selected" });
      userId = result.get("id");
    });

  try {
    await new SatelliteImage({ data, user_id: userId, field_id, polygon })
      .save()
      .then((result) => {
        return res.status(201).json({ type: "success", imagesData: result });
      })
      .catch((err) => {
        return res.status(500).json({ type: "danger", message: err });
      });
  } catch (error) {
    res.status(500).json({ type: "danger", message: "error_user" });
  }
};

// const getSatelliteImages = async (req, res) => {
//     const { fieldId } = req.params;
//     try {
//         // Fetch satellite images for the given fieldId
//         const satelliteImages = await new SatelliteData()
//             .query(qb =>
//                 qb
//                 .where('field_id', '=', fieldId)
//                 .andWhere('deleted_at', 'is', null)
//             )
//             .fetchAll({ require: false });

//         // Extracting image data from the fetched satelliteImages
//         const imagesData = await Promise.all(
//             JSON.parse(JSON.stringify(satelliteImages)).map(async (image) => {
//                 try {
//                     // Fetch statistics data for each image asynchronously
//                     const statsData = await Promise.all(
//                         image.data.map(async (data) => {
//                             try {
//                                 // Create an object to store the updated statistics data
//                                 const updatedStats = {};
//                                 // Iterate over the keys in the 'stats' object
//                                 for (const [statKey, statsURL] of Object.entries(data.stats)) {
//                                     // Fetch statistics data for the current key
//                                     const response = await fetch(statsURL);
//                                     if (!response.ok) {
//                                         throw new Error(`HTTP error! Status: ${response.status}`);
//                                     }
//                                     // Parse the response as JSON
//                                     const responseData = await response.json();
//                                     // Assign the fetched statistics data to the corresponding key
//                                     updatedStats[statKey] = responseData;
//                                 }
//                                 return updatedStats;
//                             } catch (error) {
//                                 console.error("Error fetching stats data:", error);
//                                 return null;
//                             }
//                         })
//                     );
//                     // Update the 'stats' object in the 'data' array
//                     const updatedData = image.data.map((data, index) => ({
//                         ...data,
//                         stats: statsData[index]
//                     }));
//                     // Replace the 'data' array with updated data
//                     const updatedImage = { ...image, data: updatedData };
//                     return updatedImage;
//                 } catch (error) {
//                     console.error("Error processing image data:", error);
//                     return null;
//                 }
//             })
//         );
//         // Return the success response with fetched images and updated statistics data
//         return res.status(201).json({ message: 'success', imagesData });
//     } catch (error) {
//         // Handle any errors occurred during the process
//         console.error("Error getting satellite images:", error);
//         return res.status(500).json({ type: 'danger', message: 'error_get_images' });
//     }
// };

const getSatelliteImages = async (req, res) => {
  const { fieldId } = req.params;
  try {
    const satelliteImages = await new SatelliteImage()
      .query((qb) =>
        qb.where("field_id", "=", fieldId).andWhere("deleted_at", "is", null)
      )
      .fetchAll({ require: false })
      .then(async (result) => {
        return res.status(201).json({ message: "success", imagesData: result });
      });
  } catch (error) {
    return res
      .status(500)
      .json({ type: "danger", message: "error_get_images" });
  }
};

const getSatelliteImagesUrls = async (req, res) => {
  const { userId, fieldId, date } = req.params;
  const folderPath = path.join(
    __dirname,
    "../../docs",
    `user_${userId}`,
    `field_${fieldId}`,
    date
  );
  console.log(folderPath);
  // Check if the folder for the provided user ID, field ID, and date exists
  if (!fs.existsSync(folderPath)) {
    return res
      .status(404)
      .json({ message: "No images found for the provided parameters" });
  }

  try {
    // Read the files in the folder
    const fileNames = fs.readdirSync(folderPath);

    // Send the image files as a response
    return res.status(200).json({ message: "Success", imagesData: fileNames });
  } catch (error) {
    console.error("Error reading folder contents:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const addSatelliteImagesSentinel = async (req, res) => {
  // return;
  try {
    const fromDate = req.body.fromDate;
    const toDate = req.body.toDate;
    const coordinates = req.body.coordinates;
    const { userId, fieldId } = req.params;
    async function getUserByUID(uid) {
      const user = await knex('users')
        .where({ uid }) // assuming the column is called `uid`
        .first(); // take the first match
    
      return user;
    }
    
    // Example usage:
    const user=await getUserByUID(userId)

    const { tokenJson, evalscripts } = await sentinel();

    if (!tokenJson.access_token) {
      return res.status(401).json({
        type: "danger",
        message: "Failed to get Sentinel token",
        details: tokenJson,
      });
    }

    const access_token = tokenJson.access_token;
    let successCount = 0;
    let images=[]

    // let coordinates = field.coordinates;
    // if (typeof coordinates === "string") {
    //   try {
    //     coordinates = JSON.parse(coordinates);
    //   } catch (e) {
    //     console.error("Invalid coordinates format", e);
    //   }
    // }

    const bbox = getBboxFromPolygon(coordinates);

    for (const type of Object.keys(evalscripts)) {
      try {
        const imageRes = await fetch(
          "https://services.sentinel-hub.com/api/v1/process",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              input: {
                // bounds: { bbox },
                // bounds: { coordinates },
                bounds: {
                  geometry: {
                    type: "Polygon",
                    coordinates: [coordinates],
                  },
                },
                data: [
                  {
                    type: "S2L2A",
                    dataFilter: {
                      timeRange: {
                        from: "2025-04-01T00:00:00Z",
                        to: "2025-04-15T00:00:00Z",
                      },
                      mosaickingOrder: "mostRecent",
                    },
                  },
                ],
              },
              output: {
                width: 512,
                height: 512,
                responses: [
                  { identifier: "default", format: { type: "image/png" } },
                ],
              },

              evalscript: unescapeEvalscript(evalscripts[type]),
            }),
          }
        );
        if (!imageRes.ok) {
          console.error(
            // `Failed image fetch for ${type} (User ${user.id}, Field ${field.id})`,
            `Failed image fetch for ${type}`,
            await imageRes.text()
          );
          continue;
        }

        const buffer = await imageRes.buffer();
        if (!buffer || buffer.length < 1000) {
          console.warn(`Empty or invalid image for ${type}`);
          continue;
        }
        console.log(buffer, "imageRes");

        const fileName = `${type}_${uuidv4()}.png`;
        const staticUrl = await saveToStaticServer(
          // user.id,
          fieldId,
          buffer,
          fileName
        );



       const image= await new SatelliteImage({
          user_id:user.id,
          field_id: fieldId,
          data: JSON.stringify(coordinates),
          image_url: staticUrl,
          type,
          deleted_at: null,
        }).save(null, { method: "insert" });
images=[...images,image]
        successCount++;
      } catch (err) {
        console.error(`Error processing ${type} :`, err.message);
      }
    }

    return res.status(201).json({
      type: "success",
      message: `Satellite images fetched and saved for all users and fields.`,
      savedImages: successCount,
      images
    });
  } catch (err) {
    console.error("Global error in addSatelliteImagesSentinel:", err);
    return res.status(500).json({
      type: "danger",
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports = {
  addSatelliteImages,
  getSatelliteImages,
  getSatelliteImagesUrls,
  addSatelliteImagesSentinel,
};
function unescapeEvalscript(escapedScript) {
  return escapedScript.replace(/\\n/g, "\n").replace(/\\"/g, '"');
}

function getBboxFromPolygon(polygon) {
  if (!Array.isArray(polygon) || polygon.length === 0) return null;
  let lats = polygon.map((p) => p.Lat);
  let longs = polygon.map((p) => p.Long);
  return [
    Math.min(...longs),
    Math.min(...lats),
    Math.max(...longs),
    Math.max(...lats),
  ];
}
async function saveToStaticServer(field_id, buffer, fileName) {
  const today = new Date().toISOString().split("T")[0];
  const folderPath = path.join(
    __dirname,
    "../../public/satellite-images",
    // `user_${userId}`,
    `field_${field_id}`,
    today
  );
  fs.mkdirSync(folderPath, { recursive: true });

  const filePath = path.join(folderPath, fileName);
  fs.writeFileSync(filePath, buffer);

  return `/static/satellite-images/field_${field_id}/${today}/${fileName}`;
}
async function sentinel() {
  // Fetch users and their farms/fields

  const ndviEvalscript = `//VERSION=3
  
     function setup() {
       return {
         input: ["B04", "B08", "SCL", "dataMask"],
         output: [
           { id: "default", bands: 4 },
           { id: "index", bands: 1, sampleType: "FLOAT32" },
           { id: "eobrowserStats", bands: 2, sampleType: "FLOAT32" },
           { id: "dataMask", bands: 1 }
         ]
       };
     }
     
     function evaluatePixel(samples) {
       let val = index(samples.B08, samples.B04);
       let imgVals = null;
       const indexVal = samples.dataMask === 1 ? val : NaN;
     
       if (val < -0.5) imgVals = [0.05, 0.05, 0.05, samples.dataMask];
       else if (val < -0.2) imgVals = [0.75, 0.75, 0.75, samples.dataMask];
       else if (val < -0.1) imgVals = [0.86, 0.86, 0.86, samples.dataMask];
       else if (val < 0) imgVals = [0.92, 0.92, 0.92, samples.dataMask];
       else if (val < 0.025) imgVals = [1, 0.98, 0.8, samples.dataMask];
       else if (val < 0.05) imgVals = [0.93, 0.91, 0.71, samples.dataMask];
       else if (val < 0.075) imgVals = [0.87, 0.85, 0.61, samples.dataMask];
       else if (val < 0.1) imgVals = [0.8, 0.78, 0.51, samples.dataMask];
       else if (val < 0.125) imgVals = [0.74, 0.72, 0.42, samples.dataMask];
       else if (val < 0.15) imgVals = [0.69, 0.76, 0.38, samples.dataMask];
       else if (val < 0.175) imgVals = [0.64, 0.8, 0.35, samples.dataMask];
       else if (val < 0.2) imgVals = [0.57, 0.75, 0.32, samples.dataMask];
       else if (val < 0.25) imgVals = [0.5, 0.7, 0.28, samples.dataMask];
       else if (val < 0.3) imgVals = [0.44, 0.64, 0.25, samples.dataMask];
       else if (val < 0.35) imgVals = [0.38, 0.59, 0.21, samples.dataMask];
       else if (val < 0.4) imgVals = [0.31, 0.54, 0.18, samples.dataMask];
       else if (val < 0.45) imgVals = [0.25, 0.49, 0.14, samples.dataMask];
       else if (val < 0.5) imgVals = [0.19, 0.43, 0.11, samples.dataMask];
       else if (val < 0.55) imgVals = [0.13, 0.38, 0.07, samples.dataMask];
       else if (val < 0.6) imgVals = [0.06, 0.33, 0.04, samples.dataMask];
       else imgVals = [0, 0.27, 0, samples.dataMask];
       
       return {
         default: imgVals,
         index: [indexVal],
         eobrowserStats: [val, isCloud(samples.SCL) ? 1 : 0],
         dataMask: [samples.dataMask]
       };
     }
     
     function isCloud(scl) {
       if (scl == 3) return false;
       if (scl == 9) return true;
       if (scl == 8) return true;
       if (scl == 7) return false;
       if (scl == 10) return true;
       if (scl == 11) return false;
       if (scl == 1) return false;
       if (scl == 2) return false;
       return false;
     }`;
  const moistureEvalscriptEscaped = `//VERSION=3\\nconst moistureRamps = [\\n    [-0.8, 0x800000],\\n    [-0.24, 0xff0000],\\n    [-0.032, 0xffff00],\\n    [0.032, 0x00ffff],\\n    [0.24, 0x0000ff],\\n    [0.8, 0x000080]\\n  ];\\n\\nconst viz = new ColorRampVisualizer(moistureRamps);\\n\\nfunction setup() {\\n  return {\\n    input: [\\"B8A\\", \\"B11\\", \\"SCL\\", \\"dataMask\\"],\\n    output: [\\n      { id: \\"default\\", bands: 4 },\\n      { id: \\"index\\", bands: 1, sampleType: \\"FLOAT32\\" },\\n      { id: \\"eobrowserStats\\", bands: 2, sampleType: \\"FLOAT32\\" },\\n      { id: \\"dataMask\\", bands: 1 },\\n    ],\\n  };\\n}\\n\\nfunction evaluatePixel(samples) {\\n  let val = index(samples.B8A, samples.B11);\\n  const indexVal = samples.dataMask === 1 ? val : NaN;\\n  return {\\n    default: [...viz.process(val), samples.dataMask],\\n    index: [indexVal],\\n    eobrowserStats: [val, isCloud(samples.SCL) ? 1 : 0],\\n    dataMask: [samples.dataMask],\\n  };\\n}\\n\\nfunction isCloud(scl) {\\n  if (scl == 3) { return false; }\\n  else if (scl == 9) { return true; }\\n  else if (scl == 8) { return true; }\\n  else if (scl == 7) { return false; }\\n  else if (scl == 10) { return true; }\\n  else if (scl == 11) { return false; }\\n  else if (scl == 1) { return false; }\\n  else if (scl == 2) { return false; }\\n  return false;\\n}`;
  const ndwiEvalscript = `//VERSION=3
     //ndwi
     const colorRamp1 = [
       [0, 0xFFFFFF],
       [1, 0x008000]
     ];
     const colorRamp2 = [
       [0, 0xFFFFFF],
       [1, 0x0000CC]
     ];
     
     let viz1 = new ColorRampVisualizer(colorRamp1);
     let viz2 = new ColorRampVisualizer(colorRamp2);
     
     function setup() {
       return {
         input: ["B03", "B08", "SCL", "dataMask"],
         output: [
           { id: "default", bands: 4 },
           { id: "index", bands: 1, sampleType: "FLOAT32" },
           { id: "eobrowserStats", bands: 2, sampleType: "FLOAT32" },
           { id: "dataMask", bands: 1 }
         ]
       };
     }
     
     function evaluatePixel(samples) {
       let val = index(samples.B03, samples.B08);
       let imgVals = null;
       const indexVal = samples.dataMask === 1 ? val : NaN;
       
       if (val < 0) {
         imgVals = [...viz1.process(-val), samples.dataMask];
       } else {
         imgVals = [...viz2.process(Math.sqrt(Math.sqrt(val))), samples.dataMask];
       }
       return {
         default: imgVals,
         index: [indexVal],
         eobrowserStats: [val, isCloud(samples.SCL) ? 1 : 0],
         dataMask: [samples.dataMask]
       };
     }
     
     function isCloud(scl) {
       if (scl == 3) return false;
       if (scl == 9) return true;
       if (scl == 8) return true;
       if (scl == 7) return false;
       if (scl == 10) return true;
       if (scl == 11) return false;
       if (scl == 1) return false;
       if (scl == 2) return false;
       return false;
     }`;
  const swirEvalscriptEscaped = `//VERSION=3\\nlet minVal = 0.0;\\nlet maxVal = 0.4;\\n\\nlet viz = new HighlightCompressVisualizer(minVal, maxVal);\\n\\nfunction setup() {\\n  return {\\n    input: [\\"B12\\", \\"B8A\\", \\"B04\\",\\"dataMask\\"],\\n    output: { bands: 4 }\\n  };\\n}\\n\\nfunction evaluatePixel(samples) {\\n    let val = [samples.B12, samples.B8A, samples.B04, samples.dataMask];\\n    return viz.processList(val);\\n}`;

  const evalscripts = {
    ndvi: ndviEvalscript,

    ndwi: ndwiEvalscript,

    swir: swirEvalscriptEscaped,

    moisture: moistureEvalscriptEscaped,
  };

  const tokenResponse = await fetch(
    "https://services.sentinel-hub.com/oauth/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: "15521c37-1358-4976-a2f1-66a38393cb08",
        client_secret: "vU0XFbIIds9GEYB5MK9manB0o2LtJXmY",
      }),
    }
  );

  return { tokenJson: await tokenResponse.json(), evalscripts };
}
