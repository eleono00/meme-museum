const express = require('express');
const router = express.Router(); // Abbiamo definito la variabile 'router' qui
const multer = require('multer');
const memeController = require('../controllers/memeController');
const authMiddleware = require('../middleware/authMiddleware');

// --- CONFIGURAZIONE MULTER ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// --- LE ROTTE ---

// Qui stavi usando "route.post", ma la variabile sopra si chiama "router"
router.post('/create', authMiddleware, upload.single('image'), memeController.createMeme);

router.get('/', memeController.getAllMemes);
router.post('/:id/comments', authMiddleware, memeController.addComment);
module.exports = router;