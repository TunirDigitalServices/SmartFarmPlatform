/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.hasTable('timerelays').then(exists => {
    if (!exists) {
      return knex.schema.createTable('timerelays', function (table) {
        table.increments('id').primary();
        table.uuid('uid').defaultTo(knex.raw('(UUID())')).notNullable();
        table.time('start_time')
        table.time('end_time')
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("deleted_at");
        table.timestamp("updated_at")
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
