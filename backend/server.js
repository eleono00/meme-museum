const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database');

// Modelli
const User = require('./models/User');
const Meme = require('./models/Meme');
const Tag = require('./models/Tag');
const Comment = require('./models/Comment');
const Like = require('./models/Like');
const Dislike = require('./models/Dislike');

// Rotte
const authRoutes = require('./routes/authRoutes');
const memeRoutes = require('./routes/memeRoutes');

const app = express();
const PORT = 3001;

// Middleware globali
app.use(cors({ origin: '*' })); // Abilita CORS per il frontend
app.use(express.json());        // Parsing del body in formato JSON

// Logger richieste (utile per debug)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Configurazione cartella statica per le immagini
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Definizione Associazioni Database ---

// Relazioni Utente - Meme
User.hasMany(Meme, { onDelete: 'CASCADE' });
Meme.belongsTo(User);

// Relazioni Commenti
User.hasMany(Comment, { onDelete: 'CASCADE' });
Comment.belongsTo(User);
Meme.hasMany(Comment, { onDelete: 'CASCADE' });
Comment.belongsTo(Meme);

// Relazioni Tag (Molti a Molti)
Meme.belongsToMany(Tag, { through: 'MemeTags', onDelete: 'CASCADE' });
Tag.belongsToMany(Meme, { through: 'MemeTags', onDelete: 'CASCADE' });

// Relazioni Like
User.hasMany(Like, { onDelete: 'CASCADE' });
Like.belongsTo(User);
Meme.hasMany(Like, { onDelete: 'CASCADE' });
Like.belongsTo(Meme);

// Relazioni Dislike
User.hasMany(Dislike, { onDelete: 'CASCADE' });
Dislike.belongsTo(User);
Meme.hasMany(Dislike, { onDelete: 'CASCADE' });
Dislike.belongsTo(Meme);

// Registrazione Rotte API
app.use('/api/auth', authRoutes);
app.use('/api/memes', memeRoutes);

// Sincronizzazione Database e Avvio Server
sequelize.sync({ force: false })
    .then(() => {
        console.log('Database connesso e sincronizzato.');
        app.listen(PORT, () => {
            console.log(`Server avviato su http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Errore durante la connessione al database:', err);
    });