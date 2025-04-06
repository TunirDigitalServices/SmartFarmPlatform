const knex = require('../knex/knex.js');

// use bookshelf instance to create models
module.exports = require('bookshelf')(knex);
