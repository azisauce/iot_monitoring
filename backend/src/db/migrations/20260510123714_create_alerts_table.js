exports.up = function (knex) {
  return knex.schema.createTable('alerts', (table) => {
    table.increments('id').primary();

    table.integer('device_id')
      .unsigned()
      .references('id')
      .inTable('devices')
      .onDelete('CASCADE');

    table.string('message').notNullable();

    table.string('severity').defaultTo('warning');

    table.boolean('resolved').defaultTo(false);

    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('alerts');
};