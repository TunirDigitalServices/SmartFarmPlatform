/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 exports.up = function(knex) {
    return knex.schema
    .createTable('cities_weather', function (table) {
        table.increments('id').primary();
        table.uuid('uid').defaultTo(knex.raw('(UUID())')).notNullable();
        table.integer('city_id').unsigned().nullable();
        table.foreign('city_id').references('lat_lon_cities.id');
        table.string('year')
        table.json('weather_data')
        table.json('rain_data')
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("deleted_at");
        table.timestamp("updated_at")
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
