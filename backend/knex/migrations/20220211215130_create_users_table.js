/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
        .createTable('users', function (table) {
            table.increments('id').primary();
            table.uuid('uid').defaultTo(knex.raw('(UUID())')).notNullable();
            table.string('name', 255).notNullable();
            table.string('email', 255).notNullable();
            table.string('password', 255).notNullable();
            table.string('activation_account_token', 255).nullable();
            table.string('change_password_token', 255).nullable();
            table.enu('offer_type', ['1', '2']).notNullable().defaultTo('1');
            table.enu('role', ['ROLE_ADMIN', 'ROLE_USER']).notNullable().defaultTo('ROLE_USER');
            table.enu('is_active', ['0', '1']).notNullable().defaultTo('1');
            table.enu('is_valid', ['0', '1']).notNullable().defaultTo('0');
            table.timestamp("created_at").defaultTo(knex.fn.now());
            table.timestamp("deleted_at");
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
        .dropTable('users');
};
