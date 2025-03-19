/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
    .createTable('subscription', function (table) {
        table.increments('id').primary();
        table.uuid('uid').defaultTo(knex.raw('(UUID())')).notNullable();
        table.integer('user_id').unsigned().notNullable();
        table.foreign('user_id').references('users.id');
        table.timestamp('start').notNullable();
        table.timestamp('end').notNullable();
        table.text('description').nullable();
        table.enu('is_active', ['0', '1']).notNullable().defaultTo('1');
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
