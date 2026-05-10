exports.up = function (knex) {
  return knex.schema
    .alterTable('devices', (table) => {
      // Add tenant reference (nullable initially for migration safety)
      table.integer('tenant_id').unsigned().references('id').inTable('tenants').onDelete('CASCADE').nullable();
      
      // QR code payload for device registration
      table.text('qr_secret').unique();
      
      // Replace boolean 'active' with enum for more states
      // Note: Knex doesn't support renaming in all dialects, so we add new + migrate data
      table.enum('status', ['inactive', 'active', 'maintenance']).defaultTo('inactive');
      
      // Device authentication key (for MQTT auth)
      table.string('device_key');
      
      // Last seen timestamp
      table.timestamp('last_seen');
      
      // Configuration JSON (thresholds, intervals)
      table.jsonb('config');
    });
};

exports.down = function (knex) {
  return knex.schema.alterTable('devices', (table) => {
    table.dropColumn('tenant_id');
    table.dropColumn('qr_secret');
    table.dropColumn('status');
    table.dropColumn('device_key');
    table.dropColumn('last_seen');
    table.dropColumn('config');
  });
};