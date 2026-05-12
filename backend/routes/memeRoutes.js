const express = require('express');
const router = express.Router();
const memeController = require('../controllers/memeController');
const { authenticateToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload'); 

// ROTTE PUBBLICHE

// Meme del giorno 
router.get('/day', memeController.getMemeOfTheDay);

// Visualizza tutti i meme
router.get('/', memeController.getAllMemes);


// ROTTE PRIVATE 

// Carica un nuovo meme
router.post('/', authenticateToken, upload.single('image'), memeController.createMeme);

//  Elimina un proprio meme
router.delete('/:id', authenticateToken, memeController.deleteMeme);

// Aggiunge un commento a un meme
router.post('/:id/comments', authenticateToken, memeController.addComment);

//  Mette o toglie Like a un meme
router.post('/:id/like', authenticateToken, memeController.toggleLike);

//  Mette o toglie DisLike a un meme
router.post('/:id/dislike', authenticateToken, memeController.toggleDislike);

module.exports = router;