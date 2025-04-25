/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
    .createTable('field', function (table) {
        table.increments('id').primary();
        table.uuid('uid').defaultTo(knex.raw('(UUID())')).notNullable();
        table.integer('farm_id').unsigned().notNullable();
        table.foreign('farm_id').references('farm.id');
        table.string('name', 255).notNullable();
        table.text('description').nullable();
        table.string('soil_zone', 255).nullable();
        table.string('source', 255).nullable();
        table.string('soil_property', 255).nullable();
        table.integer('depth_level').nullable();
        table.string('soil_type', 255).nullable();
        table.string('address', 255).nullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("deleted_at");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
