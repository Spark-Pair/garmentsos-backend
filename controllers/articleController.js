const ArticleQuery = require('../db/article.query');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const appConfig = require('../app.config.json');

// @desc    Get all articles with filtering, sorting, pagination
// @route   GET /api/articles
// @access  Private
exports.getArticles = async (req, res) => {
  try {
    const {
      search,
      season,
      category,
      fabric_type,
      sortBy = 'created_at',
      order = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const filters = {
      search: search?.trim(),
      season: season?.trim(),
      category: category?.trim(),
      fabric_type: fabric_type?.trim(),
      sortBy,
      order
    };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const articles = ArticleQuery.getAll(filters, { limit: limitNum, offset });
    const total = ArticleQuery.count(filters);

    articles.forEach(article => {
      article.rates = ArticleQuery.getRates(article.id);
    });

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: articles,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get Articles Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch articles',
      error: appConfig.app.environment === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single article
// @route   GET /api/articles/:id
// @access  Private
exports.getArticle = async (req, res) => {
  try {
    const article = ArticleQuery.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    res.status(200).json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Get Article Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch article',
      error: appConfig.app.environment === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create article
// @route   POST /api/articles
// @access  Private
exports.createArticle = async (req, res) => {
  try {
    const {
      article_no, season, size, category,
      description, fabric_type, quantity, rates, sales_rate
    } = req.body;

    const exists = ArticleQuery.findByArticleNo(article_no);
    if (exists) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Article number already exists'
      });
    }

    // Parse rates from frontend format
    const parsedRates = typeof rates === 'string' ? JSON.parse(rates) : rates;
    const total_cost = parsedRates.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

    const salesRateNum = parseFloat(sales_rate);
    const profit_margin = salesRateNum > 0 && total_cost > 0
      ? ((salesRateNum - total_cost) / salesRateNum) * 100
      : 0;

    let image_url = '';
    if (req.file) {
      image_url = req.file.path.replace(/\\/g, '/');
    }

    const articleData = {
      article_no,
      season,
      size,
      category,
      description: description || null,
      fabric_type,
      quantity: parseInt(quantity),
      total_cost,
      sales_rate: salesRateNum,
      profit_margin,
      image: image_url,
      created_by: req.user.id
    };

    const article = ArticleQuery.create(articleData, parsedRates);

    res.status(201).json({
      success: true,
      data: article
    });

  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error('Create Article Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update article
// @route   PUT /api/articles/:id
// @access  Private
exports.updateArticle = async (req, res) => {
  try {
    let article = ArticleQuery.findById(req.params.id);

    if (!article) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    const { rates, sales_rate, ...otherData } = req.body;
    let updateData = { ...otherData };

    let parsedRates = null;
    if (rates) {
      parsedRates = typeof rates === 'string' ? JSON.parse(rates) : rates;
      updateData.total_cost = parsedRates.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    }

    if (sales_rate) {
      updateData.sales_rate = parseFloat(sales_rate);
    }

    const finalSalesRate = updateData.sales_rate || article.sales_rate;
    const finalTotalCost = updateData.total_cost || article.total_cost;
    
    if (finalSalesRate > 0 && finalTotalCost > 0) {
      updateData.profit_margin = ((finalSalesRate - finalTotalCost) / finalSalesRate) * 100;
    }

    if (req.file) {
      const newPath = req.file.path.replace(/\\/g, '/');

      if (article.image) {
        const oldImagePath = path.join(__dirname, '..', article.image);
        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
          } catch (e) {
            console.log('Old file delete failed');
          }
        }
      }
      updateData.image = newPath;
    }

    updateData.updated_by = req.user.id;

    article = ArticleQuery.update(req.params.id, updateData, parsedRates);

    res.status(200).json({
      success: true,
      message: 'Article updated successfully',
      data: article
    });

  } catch (error) {
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
    }
    console.error('Update Article Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private
exports.deleteArticle = async (req, res) => {
  try {
    const article = ArticleQuery.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    if (article.image) {
      const imagePath = path.join(__dirname, '..', article.image);
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (e) {
          console.log('Image delete failed');
        }
      }
    }

    ArticleQuery.delete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Article deleted successfully',
      data: { id: req.params.id }
    });
  } catch (error) {
    console.error('Delete Article Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete article',
      error: appConfig.app.environment === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get article statistics
// @route   GET /api/articles/stats
// @access  Private
exports.getArticleStats = async (req, res) => {
  try {
    const stats = ArticleQuery.getStats();

    res.status(200).json({
      success: true,
      data: {
        totalArticles: stats.summary.totalArticles,
        summary: {
          totalValue: stats.summary.totalValue || 0,
          total_cost: stats.summary.total_cost || 0,
          avgSalesRate: stats.summary.avgSalesRate || 0,
          avgProfitMargin: stats.summary.avgProfitMargin || 0
        },
        categoryStats: stats.categoryStats,
        seasonStats: stats.seasonStats,
        fabricStats: stats.fabricStats
      }
    });
  } catch (error) {
    console.error('Get Article Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch article statistics',
      error: appConfig.app.environment === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get bulk articles by IDs
// @route   POST /api/articles/bulk
// @access  Private
exports.getBulkArticles = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of article IDs'
      });
    }

    if (ids.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 100 articles can be fetched at once'
      });
    }

    const articles = ArticleQuery.getBulk(ids);

    articles.forEach(article => {
      article.rates = ArticleQuery.getRates(article.id);
    });

    res.status(200).json({
      success: true,
      data: articles,
      count: articles.length
    });
  } catch (error) {
    console.error('Get Bulk Articles Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch articles',
      error: appConfig.app.environment === 'development' ? error.message : undefined
    });
  }
};