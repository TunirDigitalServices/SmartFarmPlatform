const User = require('../../models/User.js');
const Field = require('../../models/Field.js');
const SatelliteImage = require('../../models/Satelliteimage.js');
const SatelliteData = require('../../models/SatelliteData.js');

const fetch = require('node-fetch');


const addSatelliteImages = async (req,res) => {
    const {user_uid , field_id , data , polygon} = req.body
    let userId= "";
    const user = await new User({ 'uid': user_uid, deleted_at: null })
        .fetch({ require: false })
        .then(async result => {
            if (result === null) return res.status(404).json({ type: "danger", message: "no_user_selected" });
            userId = result.get('id');
        });
       
    try {   
        await new SatelliteImage({ data, user_id : userId, field_id , polygon}).save()
        .then((result) => {
            return res.status(201).json({ type:"success", imagesData : result });
        }).catch(err => {
            return res.status(500).json({ type:"danger", message: err });
        });
    } catch (error) {
        res.status(500).json({ type: "danger", message: "error_user" });

    }
} 

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


const getSatelliteImages = async (req,res) => {
    const { fieldId } = req.params
    try {
        const satelliteImages = await new SatelliteImage()
        .query(qb => qb
            .where('field_id', '=', fieldId)
            .andWhere('deleted_at', 'is', null)
        )
        .fetchAll({require : false})
        .then(async result => {
            return res.status(201).json({ message : "success" ,  imagesData : result });
        })
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_get_images" });
    }
} 


const getSatelliteImageById = async (req,res) => {
    try {
        
    } catch (error) {
        
    }
} 





module.exports = {addSatelliteImages , getSatelliteImages , getSatelliteImageById}