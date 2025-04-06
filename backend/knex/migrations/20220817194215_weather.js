/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
    .createTable('weather_data', function (table) {
        table.increments('id').primary();
        table.string('lat').nullable();
        table.string('lon', 255).nullable();
        table.string('city').nullable();
        table.string('data').notNullable();
        table.date("created_at").defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
