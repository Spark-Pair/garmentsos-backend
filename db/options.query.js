const db = require('./database');

exports.getAll = () => {
  const rows = db.prepare('SELECT option_key, option_values FROM app_options').all();
  const result = {};
  
  rows.forEach(row => {
    result[row.option_key] = JSON.parse(row.option_values);
  });

  return result;
};

exports.findByKey = (key) => {
  const row = db.prepare('SELECT option_values FROM app_options WHERE option_key = ?').get(key);
  return row ? JSON.parse(row.option_values) : null;
};

exports.upsert = (key, values) => {
  const valuesJson = JSON.stringify(values);
  
  db.prepare(`
    INSERT INTO app_options (option_key, option_values) 
    VALUES (?, ?)
    ON CONFLICT(option_key) 
    DO UPDATE SET option_values = ?, updated_at = CURRENT_TIMESTAMP
  `).run(key, valuesJson, valuesJson);

  return this.findByKey(key);
};