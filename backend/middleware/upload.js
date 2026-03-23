const multer = require('multer');
const path = require('path');

// Configurazione dello storage su disco
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Cartella di destinazione
    },
    filename: (req, file, cb) => {
        // Genero un nome univoco: timestamp + estensione originale
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

// Filtro per tipo di file (Solo immagini)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Formato file non supportato. Solo immagini.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Limite opzionale: 5MB
});

module.exports = upload;