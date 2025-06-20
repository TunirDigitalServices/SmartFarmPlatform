/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.hasTable('cities').then(exists => {
    if (!exists) {
      return knex.schema.createTable('cities', function(table) {
        table.increments('id').primary();
        table.uuid('uid').defaultTo(knex.raw('(UUID())')).notNullable();
        table.string('city',255).notNullable()
        table.string('latitude',255).nullable()
        table.string('longitude',255).nullable()
        table.integer('country_id').unsigned().nullable();
        table.foreign('country_id').references('countries.id');
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
