const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes'); 
const memeRoutes = require('./routes/memeRoutes'); 
const path = require('path');

// 1. IMPORTA TUTTI I MODELLI
const User = require('./models/User');
const Meme = require('./models/Meme');
const Tag = require('./models/Tag');     
const Comment = require('./models/Comment');

const app = express();
const PORT = 3000;


//creazione relazioni meme utente uno a molti
User.hasMany(Meme);  
Meme.belongsTo(User);

// Relazione Meme <-> Tag (Molti a Molti)
Meme.belongsToMany(Tag, { through: 'MemeTags' }); 
Tag.belongsToMany(Meme, { through: 'MemeTags' });

// NUOVA: Relazione Commenti
User.hasMany(Comment);      // Un utente scrive tanti commenti
Comment.belongsTo(User);    // Un commento è di un utente

Meme.hasMany(Comment);      // Un meme ha tanti commenti
Comment.belongsTo(Meme)

app.use(cors());
app.use(express.json());
// Rendi la cartella 'uploads' accessibile pubblicamente
app.use('/uploads', express.static('uploads'));
app.use('/api/auth', authRoutes); 
app.use('/api/memes', memeRoutes);

sequelize.sync({ alter: true }) 
    .then(() => {
        console.log(' Database sincronizzato !');
        app.listen(PORT, () => {
            console.log(` Server Backend attivo su http://localhost:${PORT}`);
        });
    })
    .catch(err => console.error('Errore:', err));