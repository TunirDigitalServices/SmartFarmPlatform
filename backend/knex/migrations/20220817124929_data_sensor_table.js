/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 exports.up = function(knex) {
  return knex.schema.hasTable('datasensor').then(exists => {
    if (!exists) {
      return knex.schema.createTable('datasensor', function (table) {
        table.increments('id').primary();
        table.uuid('uid').defaultTo(knex.raw('(UUID())')).notNullable();
        table.integer('sensor_id').unsigned().nullable();
        table.foreign('sensor_id').references('sensor.id');
        table.string('code', 255).notNullable();
        table.string('temperature').notNullable();
        table.string('humidity').notNullable();
        table.string('pressure').notNullable();
        table.string('altitude').notNullable();
        table.string('mv1').notNullable();        
        table.string('mv2').notNullable();        
        table.string('mv3').notNullable();        
        table.string('charge').notNullable();        
        table.string('adc').notNullable();        
        table.string('ts').notNullable();        
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("deleted_at");
        table.timestamp("updated_at");

     });
    }
  });
};


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
