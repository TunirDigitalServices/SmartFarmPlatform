/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
    .createTable('zone', function (table) {
        table.increments('id').primary();
        table.uuid('uid').defaultTo(knex.raw('(UUID())')).notNullable();
        table.integer('field_id').unsigned().nullable();
        table.foreign('field_id').references('field.id');
        table.string('name',255).notNullable();
        table.enu('source' , ['1' , '2']).notNullable().defaultTo('1')
        table.text('description').notNullable();
        table.json('depth_data').notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("deleted_at");


    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
