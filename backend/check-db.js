const { sequelize } = require('./src/config/database');

async function checkDB() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');

        // Get table info
        const [results] = await sequelize.query("PRAGMA table_info(users)");
        console.log('\n📊 Users table columns:');
        results.forEach(col => {
            console.log(`  - ${col.name} (${col.type})`);
        });

        // Count users
        const [count] = await sequelize.query("SELECT COUNT(*) as count FROM users");
        console.log(`\n👥 Total users: ${count[0].count}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkDB();