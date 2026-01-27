const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Comment = sequelize.define('Comment', {
    text: {
        type: DataTypes.TEXT, // TEXT permette frasi più lunghe di STRING
        allowNull: false
    }
    // UserId e MemeId verranno aggiunti automaticamente dalle relazioni in server.js
});

module.exports = Comment;