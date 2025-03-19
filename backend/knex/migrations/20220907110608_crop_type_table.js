/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 exports.up = function(knex) {
    return knex.schema
    .createTable('croptype', function (table) {
        table.increments('id').primary();
        table.uuid('uid').defaultTo(knex.raw('(UUID())')).notNullable();
        table.string('init').nullable();
        table.string('dev').nullable();
        table.string('mid').nullable();
        table.string('late').nullable();
        table.string('total').nullable();
        table.date('plant_date').nullable();
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
