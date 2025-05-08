/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 exports.up = function(knex) {
    return knex.schema
    .createTable('supplier', function (table) {
        table.increments('id').primary();
        table.uuid('uid').defaultTo(knex.raw('(UUID())')).notNullable();
        table.string('name', 255).notNullable();
        table.string('address', 255).notNullable();
        table.string('city', 255).notNullable();
        table.string('country', 255).notNullable();
        table.string('tel', 255).nullable();
        table.string('tel_mobile', 255).notNullable();
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
    .dropTable('supplier');
};
