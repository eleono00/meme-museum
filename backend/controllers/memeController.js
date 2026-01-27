const Meme = require('../models/Meme');
const Tag = require('../models/Tag');
const User = require('../models/User');
const Comment = require('../models/Comment');


exports.createMeme = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Nessuna immagine caricata!" });

        const title = req.body.title;
        const imagePath = req.file.path;
        const userId = req.user.id;
        const tagsString = req.body.tags; // Es: "#gatto, #divertente"

        // 1. Crea il Meme (senza tag per ora)
        const newMeme = await Meme.create({
            title: title,
            imagePath: imagePath,
            UserId: userId
        });

        // 2. Gestione Intelligente dei Tag
        if (tagsString) {
            // Pulisce la stringa: toglie virgole, spazi extra, cancelletti
            const tagsArray = tagsString.split(',')
                .map(tag => tag.trim().replace(/^#/, '')) // Toglie spazi e '#' iniziale
                .filter(tag => tag.length > 0); // Toglie tag vuoti

            // Per ogni parola, Trova o Crea il Tag
            for (const tagName of tagsArray) {
                // findOrCreate è magico: se esiste lo prende, se no lo crea
                const [tag, created] = await Tag.findOrCreate({
                    where: { name: tagName }
                });
                // Collega il tag al meme
                await newMeme.addTag(tag);
            }
        }

        res.status(201).json({ message: "Meme creato con Tag!", meme: newMeme });

    } catch (error) {
        console.error("Errore caricamento:", error);
        res.status(500).json({ message: "Errore del server" });
    }
};
exports.getAllMemes = async (req, res) => {
    // 🔔 QUESTA È LA SPIA:
    console.log("🔔 DRIIIN! Qualcuno ha chiamato getAllMemes! Sto cercando nel DB...");

    try {
        const memes = await Meme.findAll();
        
        console.log(`✅ Ho trovato ${memes.length} meme nel database.`); // Ci dice quanti ne trova

        res.status(200).json(memes);
    } catch (error) {
        console.error("❌ Errore:", error);
        res.status(500).json({ message: "Errore server" });
    }
};

// ... (deleteMeme resta uguale)
exports.deleteMeme = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Meme.destroy({ where: { id: id } });
        if (result) res.status(200).json({ message: "Meme eliminato!" });
        else res.status(404).json({ message: "Meme non trovato" });
    } catch (error) {
        res.status(500).json({ message: "Errore cancellazione" });
    }
};


exports.addComment = async (req, res) => {
    try {
        const { id } = req.params; // L'ID del meme (preso dall'URL)
        const { text } = req.body; // Il testo del commento
        const userId = req.user.id; // Chi sta commentando

        const newComment = await Comment.create({
            text: text,
            MemeId: id,
            UserId: userId
        });

        // Restituiamo il commento completo con il nome dell'utente (serve al frontend per mostrarlo subito)
        const fullComment = await Comment.findOne({
            where: { id: newComment.id },
            include: [{ model: User, attributes: ['username'] }]
        });

        res.status(201).json(fullComment);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Errore commento" });
    }
};
