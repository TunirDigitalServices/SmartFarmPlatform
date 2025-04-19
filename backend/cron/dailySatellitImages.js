const cron = require('node-cron');
const User = require('../models/User');
const Farm = require('../models/Farm')
const Field = require('../models/Field')
const { body, validationResult } = require('express-validator');
const logger = require('../logs.js');
const fetch = require('node-fetch');
const SatelliteImage = require('../models/Satelliteimage');


const getSatteliteImages = async (req, res) => {
    try {
        // Fetch active users with their farms and coordinates
        const users = await new User()
            .query(qb => qb
                .where('is_valid', '=', '1')
                .andWhere('role', '=', 'ROLE_USER')
                .andWhere('offer_type', '=', '2')
                .andWhere('has_images', '=', '1')
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
                            fieldId: field.get('id'), // Replace with actual field ID
                            coordinates: fieldCoordinates,
                        });
                    }
                });
            });
        });

        const apiUrl = 'https://app.satellite.robocare.tn/api/service/task/detail/';

        for (const { userId, fieldId, coordinates } of coordinatesArray) {
            try {
                const formattedCoordinates = JSON.parse(coordinates).map(coord => [coord.Long, coord.Lat]);
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ polygon: formattedCoordinates }),
                });
        
                if (!response.ok) {
                console.log(response)
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
        
                const data = await response.json();
                console.log('API request successful');
        
                if (data) {
                    // Save data for each user and field separately
                    await new SatelliteImage({ data: [data.data.data], user_id: userId, field_id: fieldId, polygon: formattedCoordinates }).save();
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