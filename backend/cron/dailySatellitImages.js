const cron = require('node-cron');
const User = require('../models/User');
const Farm = require('../models/Farm')
const Field = require('../models/Field')
const { body, validationResult } = require('express-validator');
const logger = require('../logs.js');
const fetch = require('node-fetch');
const SatelliteImage = require('../models/Satelliteimage');
const fs = require('fs');
const path = require('path');

const calculateTileCoordinates = (latitude, longitude, zoomLevel) => {
    const tileSize = 256; // Standard tile size
    const latRad = Number(latitude) * Math.PI / 180;
    const n = Math.pow(2, zoomLevel);
    const xTile = Math.floor((  Number(longitude) + 180) / 360 * n);
    const yTile = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);

    return [ xTile, yTile ];
};

const downloadTileImage = async (url, designation, userUid, fieldId, xTile, yTile, zoomLevel) => {
    try {
        const modifiedUrl = url
            .replace('{z}', zoomLevel)
            .replace('{x}', xTile)
            .replace('{y}', yTile);
        console.log(modifiedUrl)
        const response = await fetch(modifiedUrl);
        if (!response.ok) {
            throw new Error(`Failed to download tile image for ${designation}`);
        }
        const buffer = await response.buffer();
        const currentDate = new Date().toISOString().split('T')[0];
        const folderPath = path.join(__dirname, `../docs/user_${userUid}/field_${fieldId}/${currentDate}`);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        const filePath = path.join(folderPath, `${designation}.png`);
        fs.writeFileSync(filePath, buffer);

        console.log(`Tile image for ${designation} downloaded and saved successfully for user ${userUid}, field ${fieldId}`);
    } catch (error) {
        console.error(`Failed to download tile image for ${designation}: ${error.message}`);
    }
};


const getSatteliteImages = async (req, res) => {
    try {
        // Fetch active users with their farms and coordinates
        const users = await new User()
            .query(qb => qb
                .where('is_valid', '=', '1')
                .andWhere('role', '=', 'ROLE_USER')
                .andWhere('offer_type', '=', '2')
                .andWhere('deleted_at', 'is', null)
            )
            .fetchAll({
                withRelated: [
                    {
                        'farms': (qb) => {
                            qb.where('deleted_at', null)
                        }
                    }, {
                        'farms.fields': (qb) => {
                            qb.where('deleted_at', null);
                        }
                    }
                ]
                , require: false
            });
        const coordinatesArray = [];
        const fetchedData = []
        users.forEach(user => {
            user.related('farms').forEach(farm => {
                farm.related('fields').forEach(field => {
                    const fieldCoordinates = field.get('coordinates');
                    if (fieldCoordinates) {
                        coordinatesArray.push({
                            userId :user.id,
                            userUid:user.get('uid'),
                            fieldId: field.get('id'), // Replace with actual field ID
                            coordinates: fieldCoordinates,
                            fieldLat : field.get('Latitude'),
                            fieldLon : field.get('Longitude')

                        });
                    }
                });
            });
        });

        const apiUrl = 'https://app.satellite.robocare.tn/api/service/task/detail/';
        const zoomLevel = 17;

        for (const { userId,userUid, fieldId, coordinates , fieldLat , fieldLon } of coordinatesArray) {
            try {
                console.log(userUid)
                const formattedCoordinates = JSON.parse(coordinates).map(coord => [coord.Long, coord.Lat]);
                 // Calculate tile coordinates
                 const [latitude, longitude] = formattedCoordinates[0]; // Assuming the first point is representative
                 const [xTile, yTile] = calculateTileCoordinates(fieldLat, fieldLon, zoomLevel);
 
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ polygon: formattedCoordinates }),
                });
        
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
        
                const data = await response.json();
                console.log('API request successful');
        
                if (data) {
                    // Save data for each user and field separately
                    // await new SatelliteImage({ data: [data.data.data], user_id: userId, field_id: fieldId, polygon: formattedCoordinates }).save();
                    const dataEntries = Object.entries(data.data.data);
                            for (const [key, value] of dataEntries) {
                                const designation = value.designation;
                                const url = value.url;
                            
                                await downloadTileImage(url, designation, userUid, fieldId , xTile , yTile , zoomLevel);
                            }
                        }
                    
                
            } catch (error) {
                console.error('API request error:', error.message);
            }
        }
        
    } catch (error) {
        console.error('Server error:', error.message);
        // res.status(500).json({ error: 'Internal Server Error' });
    }
};


cron.schedule('* * * * *', async () => {
    console.log('Running cron job at 00:30');

    try {
        await getSatteliteImages({}, {});
    } catch (error) {
        console.error('Cron job error:', error.message);
    }
});