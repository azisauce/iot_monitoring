exports.up = function (knex) {
  return knex.schema
    // Create tenants table
    .createTable('tenants', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('slug').unique().notNullable(); // URL-safe identifier
      table.timestamps(true, true);
    })
    // Create users table
    .createTable('users', (table) => {
      table.increments('id').primary();
      table.integer('tenant_id').unsigned().references('id').inTable('tenants').onDelete('CASCADE');
      table.string('email').notNullable();
      table.string('password_hash').notNullable();
      table.enum('role', ['admin', 'technician', 'observer']).defaultTo('observer');
      table.timestamps(true, true);
      
      // Email must be unique PER TENANT (not globally)
      table.unique(['email', 'tenant_id']);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('users')
    .dropTableIfExists('tenants');
};