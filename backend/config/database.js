const { Sequelize } = require('sequelize');

// Configurazione Database SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './mememuseum.sqlite', // posizione della cartella dei file 
    logging: false 
});

module.exports = sequelize;