const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Quando qualcuno manda una POST a "/register", esegui la funzione register
router.post('/register', authController.register);

router.post('/login', authController.login);

module.exports = router;