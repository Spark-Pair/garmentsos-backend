const db = require('./database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const appConfig = require('../app.config.json');

exports.findByUsername = (username) => {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username.toLowerCase());
};

exports.findById = (id) => {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
};

exports.getAll = () => {
  return db.prepare('SELECT id, name, username, role, is_active, created_at FROM users ORDER BY created_at DESC').all();
};

exports.create = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  
  const info = db.prepare(`
    INSERT INTO users (name, username, password, role, is_active, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    data.name,
    data.username.toLowerCase(),
    hashedPassword,
    data.role || 'user',
    data.isActive !== undefined ? (data.isActive ? 1 : 0) : 1,
    data.created_by || null
  );

  return this.findById(info.lastInsertRowid);
};

exports.update = async (id, data) => {
  let query = 'UPDATE users SET ';
  const params = [];

  if (data.name) {
    query += 'name = ?, ';
    params.push(data.name);
  }

  if (data.password) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    query += 'password = ?, ';
    params.push(hashedPassword);
  }

  if (data.role) {
    query += 'role = ?, ';
    params.push(data.role);
  }

  if (data.isActive !== undefined) {
    query += 'is_active = ?, ';
    params.push(data.isActive ? 1 : 0);
  }

  query += 'updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  params.push(id);

  db.prepare(query).run(...params);
  return this.findById(id);
};

exports.delete = (id) => {
  return db.prepare('DELETE FROM users WHERE id = ?').run(id);
};

exports.comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

exports.generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    appConfig.security.jwt_secret,
    { expiresIn: appConfig.security.jwt_expire }
  );
};