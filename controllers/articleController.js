const { log } = require('console');
const Article = require('../models/Article');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

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
            sortBy = 'createdAt',
            order = 'desc',
            page = 1,
            limit = 10
        } = req.query;

        // Build query
        const query = {};

        // Search filter - search in article_no, description, size
        if (search && search.trim()) {
            query.$or = [
                { article_no: { $regex: search.trim(), $options: 'i' } },
                { description: { $regex: search.trim(), $options: 'i' } },
                { size: { $regex: search.trim(), $options: 'i' } }
            ];
        }

        // Season filter
        if (season && season.trim()) {
            query.season = season;
        }

        // Category filter
        if (category && category.trim()) {
            query.category = category;
        }

        // Fabric type filter
        if (fabric_type && fabric_type.trim()) {
            query.fabric_type = fabric_type;
        }

        // Pagination setup with validation
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10)); // Max 100 items per page
        const skip = (pageNum - 1) * limitNum;

        // Build sort object with validation
        const validSortFields = ['createdAt', 'article_no', 'sales_rate', 'total_cost', 'season', 'category', 'updatedAt'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        const sortOrder = order === 'asc' ? 1 : -1;
        const sortObj = { [sortField]: sortOrder };

        // Execute queries in parallel for better performance
        const [articles, total] = await Promise.all([
            Article.find(query)
                .populate('created_by', 'name username')
                .populate('updated_by', 'name username')
                .sort(sortObj)
                .skip(skip)
                .limit(limitNum)
                .lean(), // Use lean() for better performance
            Article.countDocuments(query)
        ]);

        // Calculate pagination metadata
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
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get single article
// @route   GET /api/articles/:id
// @access  Private
exports.getArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id)
            .populate('created_by', 'name username email')
            .populate('updated_by', 'name username email');

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
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid article ID format'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to fetch article',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
            description, fabric_type,  quantity, rates, sales_rate
        } = req.body;

        // 1. Check if article_no already exists
        const exists = await Article.findOne({ article_no: article_no.toUpperCase().trim() });
        if (exists) {
            if (req.file) fs.unlinkSync(req.file.path); // Delete uploaded image if validation fails
            return res.status(400).json({ success: false, message: 'Article number already exists' });
        }

        // 2. Parse Rates & Calculate Total Cost
        const parsedRates = typeof rates === 'string' ? JSON.parse(rates) : rates;
        const total_cost = parsedRates.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

        let image_url = "";
        if (req.file) {
            // Path looks like: uploads/articles/filename.jpg
            image_url = req.file.path.replace(/\\/g, "/"); 
        }

        // 3. Create Record
        const article = new Article({
            article_no: article_no.toUpperCase().trim(),
            season,
            size,
            category,
            description,
            fabric_type,
            quantity,
            rates: parsedRates,
            total_cost,
            sales_rate: parseFloat(sales_rate),
            image: image_url,
            created_by: req.user.id
        });

        await article.save();
        res.status(201).json({ success: true, data: article });

    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path); // Cleanup on error
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update article
// @route   PUT /api/articles/:id
// @access  Private
exports.updateArticle = async (req, res) => {
    try {
        let article = await Article.findById(req.params.id);
        
        if (!article) {
            // Agar file upload ho gayi par article nahi mila, toh storage se clean karein
            if (req.file) {
                // Cloudinary ke liye fs.unlinkSync kaam nahi karta, 
                // par agar aap local storage use kar rahe hain toh ye theek hai
                if (req.file.path) fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({ success: false, message: 'Article not found' });
        }

        const { rates, sales_rate, ...otherData } = req.body;
        let updateData = { ...otherData };

        // 1. Recalculate Cost if rates change
        if (rates) {
            const parsedRates = typeof rates === 'string' ? JSON.parse(rates) : rates;
            updateData.rates = parsedRates;
            updateData.total_cost = parsedRates.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
        }

        if (sales_rate) updateData.sales_rate = parseFloat(sales_rate);

        if (req.file) {
            const newPath = req.file.path.replace(/\\/g, "/");
            
            // Purani image delete karne ka logic (Storage saaf rakhne ke liye)
            if (article.image) {
                const oldImagePath = path.join(__dirname, '..', article.image);
                if (fs.existsSync(oldImagePath)) {
                    try { fs.unlinkSync(oldImagePath); } catch (e) { console.log("Old file delete failed"); }
                }
            }
            updateData.image = newPath;
        }

        // 3. Final Update
        article = await Article.findByIdAndUpdate(
            req.params.id, 
            { $set: updateData }, // $set use karna safer hota hai
            { new: true, runValidators: true }
        );

        res.status(200).json({ 
            success: true, 
            message: 'Article updated successfully', 
            data: article 
        });

    } catch (error) {
        // Cleanup on error
        if (req.file && req.file.path) {
            try { fs.unlinkSync(req.file.path); } catch (e) {}
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private
exports.deleteArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Article not found'
            });
        }

        await article.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Article deleted successfully',
            data: { id: req.params.id }
        });
    } catch (error) {
        console.error('Delete Article Error:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid article ID format'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to delete article',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get article statistics
// @route   GET /api/articles/stats
// @access  Private
exports.getArticleStats = async (req, res) => {
    try {
        const totalArticles = await Article.countDocuments();
        
        const stats = await Article.aggregate([
            {
                $group: {
                    _id: null,
                    totalValue: { $sum: '$sales_rate' },
                    total_cost: { $sum: '$total_cost' },
                    avgSalesRate: { $avg: '$sales_rate' },
                    avgProfitMargin: { $avg: '$profit_margin' }
                }
            }
        ]);

        const categoryStats = await Article.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalValue: { $sum: '$sales_rate' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const seasonStats = await Article.aggregate([
            {
                $group: {
                    _id: '$season',
                    count: { $sum: 1 },
                    totalValue: { $sum: '$sales_rate' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const fabricStats = await Article.aggregate([
            {
                $group: {
                    _id: '$fabric_type',
                    count: { $sum: 1 },
                    totalValue: { $sum: '$sales_rate' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalArticles,
                summary: stats[0] || {
                    totalValue: 0,
                    total_cost: 0,
                    avgSalesRate: 0,
                    avgProfitMargin: 0
                },
                categoryStats,
                seasonStats,
                fabricStats
            }
        });
    } catch (error) {
        console.error('Get Article Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch article statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

        // Limit bulk fetch to prevent abuse
        if (ids.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 100 articles can be fetched at once'
            });
        }

        const articles = await Article.find({ _id: { $in: ids } })
            .populate('created_by', 'name username email')
            .populate('updated_by', 'name username email')
            .lean();

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
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};