/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.hasTable('recommendation').then(function(exists) {
    if (!exists) {
      return knex.schema.createTable('recommendation', function(table) {
        table.increments('id').primary();
        table.uuid('uid').defaultTo(knex.raw('(UUID())')).notNullable();
        table.string('title').notNullable();
        table.text('description').nullable();
        table.integer('user_id').unsigned().notNullable();
        table.foreign('user_id').references('users.id');
        table.integer('farm_id').unsigned().nullable();
        table.foreign('farm_id').references('farms.id');
        table.integer('field_id').unsigned().notNullable();
        table.foreign('field_id').references('fields.id');
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("deleted_at");
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
