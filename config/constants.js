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
const SEASONS = [
    'Spring 2024', 'Summer 2024', 'Fall 2024', 'Winter 2024',
    'Spring 2025', 'Summer 2025', 'Fall 2025', 'Winter 2025'
];

// Categories
const CATEGORIES = ['Men', 'Women', 'Kids', 'Unisex'];

// Fabric Types
const FABRIC_TYPES = ['Woven', 'Knitted', 'Non-Woven', 'Blended'];

// User Roles
const USER_ROLES = {
    DEVELOPER: 'developer',
    USER: 'user'
};

module.exports = {
    RATE_CATEGORIES,
    SEASONS,
    CATEGORIES,
    FABRIC_TYPES,
    USER_ROLES
};
