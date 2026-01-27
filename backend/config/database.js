const { Sequelize } = require('sequelize');

// Configurazione Database SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './mememuseum.sqlite', // Il file del DB verrà creato qui
    logging: false // Meno scritte nel terminale
});

module.exports = sequelize;