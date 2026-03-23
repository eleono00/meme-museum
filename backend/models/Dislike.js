const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Dislike = sequelize.define('Dislike', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
});

module.exports = Dislike;