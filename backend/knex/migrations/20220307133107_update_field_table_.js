/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 exports.up = function(knex) {
    return knex.schema.alterTable('field', table => {
        table.dropColumn('soil_zone');
        table.dropColumn('source');
        table.dropColumn('soil_property');
        table.dropColumn('depth_level');
        table.dropColumn('soil_type');  
      })
 };
 
 /**
  * @param { import("knex").Knex } knex
  * @returns { Promise<void> }
  */
 exports.down = function(knex) {
   
 };
 