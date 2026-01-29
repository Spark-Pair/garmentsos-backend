const Options = require('../models/Options');

// 1. Get All Options
exports.getAllOptions = async (req, res) => {
    try {
        const options = await Options.find();
        const result = {};
        options.forEach(opt => { result[opt.key] = opt.values; });
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Handle Dynamic Updates
exports.handleOptionUpdate = async (req, res) => {
    try {
        const { type, category } = req.params;
        const { value, index, action } = req.body;

        // Find or Create logic: Agar 'sizes' ya 'seasons' ka document nahi hai, toh bana do
        let options = await Options.findOne({ key: type });
        
        if (!options) {
            options = new Options({ 
                key: type, 
                values: type === 'rateCategories' ? { fabric: [], work: [], accessory: [], labor: [] } : [] 
            });
        }

        let target;
        if (type === 'rateCategories') {
            // Agar rateCategory ke andar specific category (e.g. fabric) nahi hai
            if (!options.values[category]) {
                options.values[category] = [];
            }
            target = options.values[category];
        } else {
            target = options.values;
        }

        // Actions logic
        if (action === 'add') {
            if (target.includes(value)) return res.status(400).json({ message: 'Item already exists' });
            target.push(value);
        } 
        else if (action === 'update' && index !== null) {
            target[index] = value;
        } 
        else if (action === 'delete' && index !== null) {
            target.splice(index, 1);
        }

        options.markModified('values');
        await options.save();
        
        res.json({ success: true, data: options.values });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};