const User = require('../../models/User.js');
const Field = require('../../models/Field.js');
const SatelliteImage = require('../../models/Satelliteimage.js');
const SatelliteData = require('../../models/SatelliteData.js');
const fs = require('fs');
const path = require('path');
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


const getSatelliteImagesUrls = async (req, res) => {
    const { userId, fieldId, date } = req.params;
    const folderPath = path.join(__dirname, '../../docs', `user_${userId}`, `field_${fieldId}`, date);
        console.log(folderPath)
    // Check if the folder for the provided user ID, field ID, and date exists
    if (!fs.existsSync(folderPath)) {
        return res.status(404).json({ message: "No images found for the provided parameters" });
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
}





module.exports = {addSatelliteImages , getSatelliteImages , getSatelliteImagesUrls}