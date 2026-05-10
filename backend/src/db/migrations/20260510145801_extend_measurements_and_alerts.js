exports.up = function (knex) {
  return knex.schema
    .alterTable('measurements', (table) => {
      // Denormalize tenant_id for faster queries (optional but recommended)
      table.integer('tenant_id').unsigned().references('id').inTable('tenants').onDelete('CASCADE').nullable();
      
      // Add index for time-series queries
      table.index(['device_id', 'created_at']);
    })
    .alterTable('alerts', (table) => {
      table.integer('tenant_id').unsigned().references('id').inTable('tenants').onDelete('CASCADE').nullable();
      
      // Add alert type for categorization
      table.enum('type', ['temperature_high', 'temperature_low', 'humidity_high', 'humidity_low', 'device_offline', 'system']).defaultTo('system');
      
      // Track when alert was resolved and by whom
      table.timestamp('resolved_at');
      table.integer('resolved_by').unsigned().references('id').inTable('users').nullable();
      
      // Index for active alerts query
      table.index(['tenant_id', 'resolved', 'created_at']);
    });
};

exports.down = function (knex) {
  return knex.schema
    .alterTable('measurements', (table) => {
      table.dropColumn('tenant_id');
      table.dropIndex(['device_id', 'created_at']);
    })
    .alterTable('alerts', (table) => {
      table.dropColumn('tenant_id');
      table.dropColumn('type');
      table.dropColumn('resolved_at');
      table.dropColumn('resolved_by');
      table.dropIndex(['tenant_id', 'resolved', 'created_at']);
    });
};