/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 exports.up = function(knex) {
    return knex.schema
    .createTable('relays', function (table) {
        table.increments('id').primary();
        table.uuid('uid').defaultTo(knex.raw('(UUID())')).notNullable();
        table.integer('port').nullable();
        table.string('name', 255).notNullable();
        table.enu('state', ['0', '1']).notNullable().defaultTo('0');
        table.integer('equipment_id').unsigned().nullable();
        table.foreign('equipment_id').references('equipment.id');
        table.integer('user_id').unsigned().nullable();
        table.foreign('user_id').references('users.id');
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
