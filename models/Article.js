const mongoose = require('mongoose');

const RateItemSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false });

const ArticleSchema = new mongoose.Schema({
    article_no: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    season: {
        type: String,
        required: true,
    },
    size: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    fabric_type: {
        type: String,
        required: true,
    },
    rates: [RateItemSchema],
    total_cost: {
        type: Number,
        default: 0
    },
    sales_rate: {
        type: Number,
        required: true,
        min: 0
    },
    profit_margin: {
        type: Number,
        default: 0
    },
    quantity: {
        type: Number,
        required: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    fabric_type: {
        type: String,
        required: true,
    },
    image: { type: String }, // Image path save karne ke liye
}, {
    timestamps: true
});

// Calculate total cost and profit margin before saving
ArticleSchema.pre('save', function(next) {
    // Calculate total cost from rates
    this.total_cost = this.rates.reduce((sum, item) => sum + item.price, 0);
    
    // Calculate profit margin
    if (this.sales_rate > 0 && this.total_cost > 0) {
        this.profit_margin = ((this.sales_rate - this.total_cost) / this.sales_rate) * 100;
    }
    
    next();
});

// Index for search and filtering
ArticleSchema.index({ article_no: 'text', description: 'text' });
ArticleSchema.index({ season: 1, category: 1, fabric_type: 1 });

module.exports = mongoose.model('Article', ArticleSchema);
