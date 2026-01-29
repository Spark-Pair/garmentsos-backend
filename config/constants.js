// Rate Categories and Subcategories
const RATE_CATEGORIES = {
    fabric: [
        'Cotton', 'Polyester', 'Silk', 'Linen', 'Wool', 
        'Denim', 'Velvet', 'Chiffon', 'Satin', 'Nylon',
        'Rayon', 'Spandex', 'Cashmere', 'Tweed', 'Fleece'
    ],
    work: [
        'Embroidery', 'Printing', 'Stitching', 'Cutting', 
        'Finishing', 'Washing', 'Dyeing', 'Ironing', 
        'Packaging', 'Quality Check', 'Hand Work', 
        'Machine Work', 'Beading', 'Sequin Work'
    ],
    accessory: [
        'Buttons', 'Zippers', 'Labels', 'Tags', 'Threads', 
        'Laces', 'Ribbons', 'Hooks', 'Snaps', 'Elastic',
        'Buckles', 'Rings', 'Studs', 'Patches', 'Motifs'
    ],
    labor: [
        'Cutting Labor', 'Stitching Labor', 'Finishing Labor', 
        'Packing Labor', 'Helper', 'Supervisor', 'QC Inspector',
        'Pressman', 'Tailor Master', 'Pattern Maker'
    ]
};

// Seasons
const SEASONS = ['Half', 'Full', 'Winter'];

// Sizes
const SIZES = ['SML', 'XL', 'MLXL', '1-2'];

// Categories
const CATEGORIES = ['1 Piece', '2 Piece', '3 Piece'];

// User Roles
const USER_ROLES = {
    DEVELOPER: 'developer',
    USER: 'user'
};

module.exports = {
    RATE_CATEGORIES,
    SEASONS,
    SIZES,
    CATEGORIES,
    USER_ROLES
};