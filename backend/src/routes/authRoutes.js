const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db/db');
const { signToken } = require('../middleware/auth');

const router = express.Router();
const SALT_ROUNDS = 10;

/**
 * POST /auth/register
 * Creates a new tenant + admin user in one shot.
 * Body: { tenantName, email, password }
 */
router.post('/register', async (req, res) => {
  const { tenantName, email, password } = req.body;

  if (!tenantName || !email || !password) {
    return res.status(400).json({ error: 'tenantName, email and password are required' });
  }

  // Derive a URL-safe slug from the tenant name
  const slug = tenantName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  try {
    // Use a transaction: both tenant + user must succeed together
    const result = await db.transaction(async (trx) => {
      // 1. Create tenant
      const [tenant] = await trx('tenants')
        .insert({ name: tenantName, slug })
        .returning(['id', 'name', 'slug']);

      // 2. Hash password
      const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

      // 3. Create the first user as admin
      const [user] = await trx('users')
        .insert({
          tenant_id: tenant.id,
          email,
          password_hash,
          role: 'admin',
        })
        .returning(['id', 'email', 'role', 'tenant_id']);

      return { tenant, user };
    });

    const token = signToken({
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
      tenant_id: result.tenant.id,
    });

    res.status(201).json({
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
      },
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        slug: result.tenant.slug,
      },
    });
  } catch (err) {
    // PostgreSQL unique violation code
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Tenant slug or email already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /auth/login
 * Body: { email, tenantSlug, password }
 * We scope login by tenant slug so the same email can exist in multiple tenants.
 */
router.post('/login', async (req, res) => {
  const { email, tenantSlug, password } = req.body;

  console.log('Login attempt:', { email, tenantSlug }); // Debug log

  if (!email || !tenantSlug || !password) {
    return res.status(400).json({ error: 'email, tenantSlug and password are required' });
  }

  try {
    // Find tenant first
    const tenant = await db('tenants').where({ slug: tenantSlug }).first();
    if (!tenant) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Find user scoped to that tenant
    const user = await db('users')
      .where({ email, tenant_id: tenant.id })
      .first();

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      tenant_id: tenant.id,
    });

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
      tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;