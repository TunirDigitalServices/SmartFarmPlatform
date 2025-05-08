/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
        .alterTable('users', function (table) {
            table.string('address', 255).nullable();
            table.string('city', 255).nullable();
            table.string('country', 255).nullable();
            table.string('zip_code', 255).nullable();
            table.text('description').nullable();
            table.string('upload_file_name', 255).nullable();
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
