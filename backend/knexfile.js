const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    development: {
      client: 'mysql',
      connection: {
        host : process.env.HOST_SQL,
        user : process.env.USER_SQL,
        password : process.env.PASSWORD_SQL,
        database : process.env.DATABASE_SQL,
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
