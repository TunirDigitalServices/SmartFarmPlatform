/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 exports.up = function(knex) {
    return knex.schema
    .createTable('equipment', function (table) {
        table.increments('id').primary();
        table.uuid('uid').defaultTo(knex.raw('(UUID())')).notNullable();
        table.string('name', 255).nullable();
        table.string('code', 255).notNullable();
        table.integer('farm_id').unsigned().nullable();
        table.foreign('farm_id').references('farm.id');
        table.integer('user_id').unsigned().notNullable();
        table.foreign('user_id').references('users.id');
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
