const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Meme = sequelize.define('Meme', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    imagePath: { // Qui salveremo l'URL o il nome del file
        type: DataTypes.STRING,
        allowNull: false
    }
    // L'ID dell'utente che lo carica verrà aggiunto automaticamente dopo!
});

module.exports = Meme;