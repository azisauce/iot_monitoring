exports.up = function (knex) {
  return knex.schema.createTable('devices', (table) => {
    table.increments('id').primary();

    table.string('device_id').notNullable().unique();

    table.string('name').notNullable();

    table.string('zone');

    table.boolean('active').defaultTo(true);

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('devices');
};