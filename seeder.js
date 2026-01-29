const UserQuery = require('./db/user.query');
const OptionsQuery = require('./db/options.query');
const { initTables } = require('./db/schema');
const appConfig = require('./app.config.json');

// Default developer user
const defaultUser = {
  name: 'SparkPair',
  username: 'sparkpair',
  password: 'sparkpair',
  role: 'developer',
  isActive: true
};

// Default options/configurations
const defaultOptions = {
  seasons: ['Half', 'Full', 'Winter'],
  
  sizes: ['SML', 'XL', 'MLXL', '1-2'],
  
  categories: ['1 Piece', '2 Piece', '3 Piece'],
  
  rateCategories: {
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
  }
};

// Initialize DB and create default user + options
const seedDatabase = async () => {
  try {
    console.log('🔄 Initializing database tables...');
    initTables();

    console.log('🔄 Checking for default user...');
    const existingUser = UserQuery.findByUsername('sparkpair');

    if (existingUser) {
      console.log('✅ Default user already exists');
      console.log(`   Username: sparkpair`);
      console.log(`   Password: sparkpair`);
    } else {
      console.log('🔄 Creating default user...');
      const user = await UserQuery.create(defaultUser);
      console.log('✅ Default user created successfully');
      console.log(`   ID: ${user.id}`);
      console.log(`   Username: sparkpair`);
      console.log(`   Password: sparkpair`);
      console.log(`   Role: developer`);
    }

    console.log('\n🔄 Seeding default options...');
    
    // Seed all options
    Object.keys(defaultOptions).forEach(key => {
      OptionsQuery.upsert(key, defaultOptions[key]);
      console.log(`   ✅ ${key} seeded`);
    });

    console.log('\n✅ Database setup complete!');
    console.log(`📦 Database file: db/garmentsos.db`);
    console.log(`🚀 Start server: npm start`);
    console.log(`🔐 Login at: http://localhost:${appConfig.app.port}/api/auth/login`);
    console.log('\n📋 Default Options Seeded:');
    console.log(`   - Seasons: ${defaultOptions.seasons.length} items`);
    console.log(`   - Sizes: ${defaultOptions.sizes.length} items`);
    console.log(`   - Categories: ${defaultOptions.categories.length} items`);
    console.log(`   - Rate Categories: 4 groups`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Delete all data except default user
const resetDatabase = async () => {
  try {
    const db = require('./db/database');
    
    console.log('🔄 Resetting database...');
    
    // Delete all except sparkpair
    db.prepare('DELETE FROM articles').run();
    db.prepare('DELETE FROM rates').run();
    db.prepare('DELETE FROM app_options').run();
    db.prepare('DELETE FROM users WHERE username != ?').run('sparkpair');
    
    console.log('✅ Database reset complete (default user preserved)');
    console.log('🔄 Re-seeding options...');
    
    // Re-seed options
    Object.keys(defaultOptions).forEach(key => {
      OptionsQuery.upsert(key, defaultOptions[key]);
    });
    
    console.log('✅ Options re-seeded');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Run based on argument
if (process.argv[2] === '-r' || process.argv[2] === '--reset') {
  resetDatabase();
} else {
  seedDatabase();
}