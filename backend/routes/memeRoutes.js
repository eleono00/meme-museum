const express = require('express');
const router = express.Router();
const memeController = require('../controllers/memeController');
const { authenticateToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload'); 

// ROTTE PUBBLICHE

// 1. Prende il Meme del giorno 
router.get('/day', memeController.getMemeOfTheDay);

// 2. Prende la lista di tutti i Meme 
router.get('/', memeController.getAllMemes);


// --- ROTTE PRIVATE 

// 3. Carica un nuovo meme
router.post('/', authenticateToken, upload.single('image'), memeController.createMeme);

// 4. Elimina un proprio meme
router.delete('/:id', authenticateToken, memeController.deleteMeme);

// 5. Aggiunge un commento a un meme
router.post('/:id/comments', authenticateToken, memeController.addComment);

// 6. Mette o toglie Like a un meme
router.post('/:id/like', authenticateToken, memeController.toggleLike);

// 7. Mette o toglie DisLike a un meme
router.post('/:id/dislike', authenticateToken, memeController.toggleDislike);

module.exports = router;