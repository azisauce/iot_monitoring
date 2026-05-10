exports.up = function (knex) {
  return knex.schema.createTable('measurements', (table) => {
    table.increments('id').primary();

    table.integer('device_id')
      .unsigned()
      .references('id')
      .inTable('devices')
      .onDelete('CASCADE');

    table.float('temperature');

    table.float('humidity');

    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('measurements');
};