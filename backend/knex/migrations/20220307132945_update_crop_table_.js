/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 exports.up = function(knex) {
    return knex.schema.alterTable('crop', table => {
         table.integer('zone_id').unsigned().nullable();
         table.foreign('zone_id').references('zone.id');   
      })
 };
 
 /**
  * @param { import("knex").Knex } knex
  * @returns { Promise<void> }
  */
 exports.down = function(knex) {
   
 };
 