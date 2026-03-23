const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rotta per registrarsi 
router.post('/register', authController.register);

// Rotta per accedere
router.post('/login', authController.login);

module.exports = router;