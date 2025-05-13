
const { calculBilanHydriqueByField } = require('../controllers/premiumCalcul/calculPremium');
const knex = require('../knex/knex');
const Field = require('../models/Field');
const User = require('../models/User');


const getFieldsToProcess = async () => {

    const fields = await new Field().fetchAll({withRelated: ['farm.user'],})  // Replace with your actual date



    return fields.toJSON();

};

// Function to process each field
const processFields = async () => {
    try {
        const fields = await getFieldsToProcess();

        if (fields.length === 0) {
            console.log('No fields to process.');
            return;
        }
console.log(fields,"---------fields");
        const fieldPromises = fields.map(field => {
            const mockReq = {
                body: {
                    fieldId: field.id,
                    userId: field.farm.user_id,
                }
            };

            const mockRes = {
                status: (code) => ({
                    json: (data) => console.log(`Response status ${code}:`, data),
                }),
            };

            console.log(`Processing field ${field.id} (user ${field.user_id})...`);
            return calculBilanHydriqueByField(mockReq, mockRes);
        });

        await Promise.all(fieldPromises);
        console.log('Cron job finished processing all fields.');
    } catch (error) {
        console.error('Error processing fields:', error);
    }
};

// Run the function
processFields()
    .then(() => console.log('Cron job completed successfully!'))
    .catch((error) => console.error('Error running cron job:', error));