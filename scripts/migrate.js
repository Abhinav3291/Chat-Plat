require('dotenv').config();
const { sequelize } = require('../config/database');
const models = require('../models');

const migrate = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Database connected');

    console.log('Running migrations...');
    await sequelize.sync({ force: false, alter: true });
    console.log('✓ Migrations completed successfully');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();

