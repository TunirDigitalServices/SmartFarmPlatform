/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
    .createTable('crop', function (table) {
        table.increments('id').primary();
        table.uuid('uid').defaultTo(knex.raw('(UUID())')).notNullable();
        table.integer('field_id').unsigned().notNullable();
        table.foreign('field_id').references('field.id');
        table.string('type', 255).nullable();
        table.string('previous_type', 255).nullable();
        table.timestamp('growth_date_start').nullable();
        table.timestamp('growth_date_end').nullable();
        table.string('ggd_maturity', 255).nullable();
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
