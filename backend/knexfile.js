const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    development: {
      client: 'mysql',
      connection: {
        host : "51.222.29.46",
        user : 'smartFarms',
        password : 'sm@rtF@rms49_',
        database : "smart_farm",
        charset: 'utf8'
      },
      pool: { min: 0, max: 100 },
      migrations: {
        directory: __dirname + '/knex/migrations',
      },
      seeds: {
        directory: __dirname + '/knex/seeds'
      }
    }
  };
