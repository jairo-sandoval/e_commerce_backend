const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const db = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  username: process.env.DB_USER_NAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB,
  port: 5432,
  logging: false,
  dialectOptions:
    process.env.NODE_ENV === 'production'
      ? {
          ssl: {
            required: true,
            rejectUnauthorized: false,
          },
        }
      : {},
});

module.exports = { db, DataTypes };
