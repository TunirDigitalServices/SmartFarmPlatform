/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const hasKcInit = await knex.schema.hasColumn('crop', 'kc_init');
  const hasKcMid = await knex.schema.hasColumn('crop', 'kc_mid');
  const hasKcLate = await knex.schema.hasColumn('crop', 'kc_late');
  const hasInit = await knex.schema.hasColumn('crop', 'init');
  const hasDev = await knex.schema.hasColumn('crop', 'dev');
  const hasMid = await knex.schema.hasColumn('crop', 'mid');
  const hasLate = await knex.schema.hasColumn('crop', 'late');
  const hasIsKcModified = await knex.schema.hasColumn('crop', 'is_kc_modified');
  const hasAllKc = await knex.schema.hasColumn('crop', 'all_kc');
  return knex.schema.alterTable('crop', function(table) {
    if (!hasKcInit) table.float('kc_init').nullable();
    if (!hasKcMid) table.float('kc_mid').nullable();
    if (!hasKcLate) table.float('kc_late').nullable();
    if (!hasInit) table.integer('init').nullable();
    if (!hasDev) table.integer('dev').nullable();
    if (!hasMid) table.integer('mid').nullable();
    if (!hasLate) table.integer('late').nullable();
     if (!hasAllKc) table.json('all_kc').nullable();
    if (!hasIsKcModified) table.boolean('is_kc_modified').defaultTo(false);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
