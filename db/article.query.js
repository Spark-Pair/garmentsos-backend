const db = require('./database');

exports.getAll = (filters = {}, pagination = {}) => {
  let query = `
    SELECT a.*, 
           u1.name as created_by_name, u1.username as created_by_username,
           u2.name as updated_by_name, u2.username as updated_by_username
    FROM articles a
    LEFT JOIN users u1 ON a.created_by = u1.id
    LEFT JOIN users u2 ON a.updated_by = u2.id
    WHERE 1=1
  `;
  
  const params = [];

  if (filters.search) {
    query += ` AND (a.article_no LIKE ? OR a.description LIKE ? OR a.size LIKE ?)`;
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (filters.season) {
    query += ` AND a.season = ?`;
    params.push(filters.season);
  }

  if (filters.category) {
    query += ` AND a.category = ?`;
    params.push(filters.category);
  }

  if (filters.fabric_type) {
    query += ` AND a.fabric_type = ?`;
    params.push(filters.fabric_type);
  }

  const validSortFields = ['created_at', 'article_no', 'sales_rate', 'total_cost', 'season', 'category', 'updated_at'];
  const sortBy = validSortFields.includes(filters.sortBy) ? filters.sortBy : 'created_at';
  const order = filters.order === 'asc' ? 'ASC' : 'DESC';
  query += ` ORDER BY a.${sortBy} ${order}`;

  if (pagination.limit) {
    query += ` LIMIT ? OFFSET ?`;
    params.push(pagination.limit, pagination.offset || 0);
  }

  return db.prepare(query).all(...params);
};

exports.count = (filters = {}) => {
  let query = 'SELECT COUNT(*) as total FROM articles WHERE 1=1';
  const params = [];

  if (filters.search) {
    query += ` AND (article_no LIKE ? OR description LIKE ? OR size LIKE ?)`;
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (filters.season) {
    query += ` AND season = ?`;
    params.push(filters.season);
  }

  if (filters.category) {
    query += ` AND category = ?`;
    params.push(filters.category);
  }

  if (filters.fabric_type) {
    query += ` AND fabric_type = ?`;
    params.push(filters.fabric_type);
  }

  return db.prepare(query).get(...params).total;
};

exports.findById = (id) => {
  const article = db.prepare(`
    SELECT a.*, 
           u1.name as created_by_name, u1.username as created_by_username,
           u2.name as updated_by_name, u2.username as updated_by_username
    FROM articles a
    LEFT JOIN users u1 ON a.created_by = u1.id
    LEFT JOIN users u2 ON a.updated_by = u2.id
    WHERE a.id = ?
  `).get(id);

  if (article) {
    article.rates = this.getRates(id);
  }

  return article;
};

exports.findByArticleNo = (article_no) => {
  return db.prepare('SELECT * FROM articles WHERE article_no = ?').get(article_no.toUpperCase());
};

exports.create = (data, rates) => {
  const info = db.prepare(`
    INSERT INTO articles (
      article_no, season, size, category, description, fabric_type,
      total_cost, sales_rate, profit_margin, quantity, image, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.article_no.toUpperCase(),
    data.season,
    data.size,
    data.category,
    data.description || null,
    data.fabric_type,
    data.total_cost,
    data.sales_rate,
    data.profit_margin,
    data.quantity,
    data.image || null,
    data.created_by
  );

  const articleId = info.lastInsertRowid;

  // Insert rates - frontend sends {description, price}
  if (rates && rates.length > 0) {
    const insertRate = db.prepare(`
      INSERT INTO rates (article_id, description, price) VALUES (?, ?, ?)
    `);

    for (const rate of rates) {
      insertRate.run(articleId, rate.description, rate.price);
    }
  }

  return this.findById(articleId);
};

exports.update = (id, data, rates) => {
  let query = 'UPDATE articles SET ';
  const params = [];

  Object.keys(data).forEach(key => {
    if (data[key] !== undefined) {
      query += `${key} = ?, `;
      params.push(data[key]);
    }
  });

  query += 'updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  params.push(id);

  db.prepare(query).run(...params);

  // Update rates if provided
  if (rates) {
    db.prepare('DELETE FROM rates WHERE article_id = ?').run(id);
    
    const insertRate = db.prepare(`
      INSERT INTO rates (article_id, description, price) VALUES (?, ?, ?)
    `);

    for (const rate of rates) {
      insertRate.run(id, rate.description, rate.price);
    }
  }

  return this.findById(id);
};

exports.delete = (id) => {
  return db.prepare('DELETE FROM articles WHERE id = ?').run(id);
};

exports.getRates = (articleId) => {
  return db.prepare('SELECT description, price FROM rates WHERE article_id = ?').all(articleId);
};

exports.getStats = () => {
  const summary = db.prepare(`
    SELECT 
      COUNT(*) as totalArticles,
      SUM(sales_rate) as totalValue,
      SUM(total_cost) as total_cost,
      AVG(sales_rate) as avgSalesRate,
      AVG(profit_margin) as avgProfitMargin
    FROM articles
  `).get();

  const categoryStats = db.prepare(`
    SELECT category as _id, COUNT(*) as count, SUM(sales_rate) as totalValue
    FROM articles
    GROUP BY category
    ORDER BY count DESC
  `).all();

  const seasonStats = db.prepare(`
    SELECT season as _id, COUNT(*) as count, SUM(sales_rate) as totalValue
    FROM articles
    GROUP BY season
    ORDER BY season
  `).all();

  const fabricStats = db.prepare(`
    SELECT fabric_type as _id, COUNT(*) as count, SUM(sales_rate) as totalValue
    FROM articles
    GROUP BY fabric_type
    ORDER BY count DESC
  `).all();

  return { summary, categoryStats, seasonStats, fabricStats };
};

exports.getBulk = (ids) => {
  const placeholders = ids.map(() => '?').join(',');
  return db.prepare(`
    SELECT a.*, 
           u1.name as created_by_name, u1.username as created_by_username
    FROM articles a
    LEFT JOIN users u1 ON a.created_by = u1.id
    WHERE a.id IN (${placeholders})
  `).all(...ids);
};