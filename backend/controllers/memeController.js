const { Op, Sequelize } = require('sequelize'); 
const Meme = require('../models/Meme');
const User = require('../models/User');
const Tag = require('../models/Tag');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const Dislike = require('../models/Dislike');


// Calcolo Paginazione
const getPagination = (page, size) => {
    const limit = size ? +size : 10; // Default 10
    const offset = (page ? page - 1 : 0) * limit;
    return { limit, offset };
};

// Funzione implementata per capire quali relazioni "joinare" alla query dei meme
const getIncludeOptions = (tagFilter) => {
    // Informazioni bas da portarmi dietro
    let options = [
        { model: User, attributes: ['username', 'id'] },
        { model: Comment, include: [{ model: User, attributes: ['username'] }] },
        { model: Like },
        { model: Dislike } 
    ];

    // Se l'utente ha cercato un tag specifico filtro i meme per quel tag
    if (tagFilter) {
        options.push({
            model: Tag,
            attributes: ['name'],
            where: { name: { [Op.like]: `%${tagFilter}%` } }
        });
    } else {
        options.push({
            model: Tag,
            attributes: ['name'],
            through: { attributes: [] }
        });
    }
    return options;
};


// Funzione per gestire i vari ordinamenti richiesti dall'utente
const getOrderClause = (sortOption) => {
    switch (sortOption) {
        case 'oldest':
            return [['createdAt', 'ASC']];
        case 'likes': 
            return [[Sequelize.literal('score'), 'DESC']];
        case 'least_likes': 
            return [[Sequelize.literal('score'), 'ASC']];
        default: 
            return [['createdAt', 'DESC']];
    }
};


exports.getAllMemes = async (req, res) => {
    try {
        const { page = 1, tag, sort, user } = req.query;
        
        // Uso le funzioni precedenti per costruire la query
        const { limit, offset } = getPagination(page, 10);
        const includeOptions = getIncludeOptions(tag);
        const orderClause = getOrderClause(sort);
        
        // se mi hano passato l'id di un utente visuizzo solo i sui meme
        let whereCondition = {};
        if (user) whereCondition.UserId = user;

        // Eseguo la quary
        const { count, rows } = await Meme.findAndCountAll({
            where: whereCondition,
            include: includeOptions,
            attributes: {
                include: [
                    [
                        Sequelize.literal(`(
                            (SELECT COUNT(*) FROM Likes WHERE Likes.MemeId = Meme.id) - 
                            (SELECT COUNT(*) FROM Dislikes WHERE Dislikes.MemeId = Meme.id)
                        )`),
                        'score'
                    ]
                ]
            },
            distinct: true,
            limit,
            offset,
            order: orderClause
        });
        
        const totalPages = Math.ceil(count / limit);

        res.status(200).json({
            memes: rows,
            currentPage: parseInt(page),
            totalPages: totalPages,
            totalMemes: count
        });

    } catch (error) {
        console.error("Errore recupero meme:", error);
        res.status(500).json({ message: "Errore interno del server." });
    }
};


exports.getMemeOfTheDay = async (req, res) => {
    try {
        const count = await Meme.count();
        if (count === 0) return res.json(null);

        // Algoritmo deterministico basato sul giorno dell'anno
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        const randomOffset = dayOfYear % count;

        const meme = await Meme.findOne({
            offset: randomOffset,
            include: [
                { model: User, attributes: ['username'] },
                { model: Tag, attributes: ['name'] },
                { model: Like },
                { model: Dislike }
            ]
        });
        res.status(200).json(meme);
    } catch (error) {
        console.error("Errore meme del giorno:", error);
        res.status(500).json({ message: "Errore interno del server." });
    }
};

exports.createMeme = async (req, res) => {
    try {
        const { title, tags } = req.body;
        let imagePath = null;
        
        // Normalizzazione path immagine per compatibilità Ubuntu
        if (req.file) {
            imagePath = req.file.path.replace(/\\/g, "/"); 
        }

        const newMeme = await Meme.create({
            title,
            imagePath,
            UserId: req.user.id // ID estratto dal Token JWT
        });

        // Gestione Tag 
        if (tags) {
            const tagList = tags.split(',')
                                .map(t => t.trim())
                                .map(t => t.replace(/^#+/, '')) // Rimuove eventuali '#'
                                .filter(t => t.length > 0);

            for (let tagName of tagList) {
                let [tag] = await Tag.findOrCreate({ where: { name: tagName } });
                await newMeme.addTag(tag);
            }
        }
        
        res.status(201).json(newMeme);
    } catch (error) {
        console.error("Errore creazione meme:", error);
        res.status(500).json({ message: "Errore interno del server." });
    }
};

exports.deleteMeme = async (req, res) => {
    try {
        const memeId = req.params.id;
        const userId = req.user.id;
        
        const meme = await Meme.findByPk(memeId);
        
        if (!meme) return res.status(404).json({ message: "Meme non trovato." });
        
        // Verifica titolarità: Solo l'autore può cancellare
        if (meme.UserId !== userId) {
            return res.status(403).json({ message: "Azione non autorizzata." });
        }

        // Pulizia , grazie a cascade nel DB, cancellando il meme si elimineranno anche commenti e like associati
        await meme.destroy();
        
        res.status(200).json({ message: "Meme eliminato con successo." });
    } catch (error) {
        console.error("Errore eliminazione meme:", error);
        res.status(500).json({ message: "Errore interno del server." });
    }
};


exports.toggleLike = async (req, res) => {
    try {
        const memeId = req.params.id;
        const userId = req.user.id;

        // Controllo se questo utente ha già messo like a questo meme
        const existingLike = await Like.findOne({ where: { MemeId: memeId, UserId: userId } });

        if (existingLike) {
            // Se esiste già, lo rimuove 
            await existingLike.destroy();
            res.status(200).json({ status: 'unliked' });
        } else {
            // Se non esiste, rimuove eventuali Dislike e aggiunge Like 
            await Dislike.destroy({ where: { MemeId: memeId, UserId: userId } });
            await Like.create({ MemeId: memeId, UserId: userId });
            res.status(201).json({ status: 'liked' });
        }
    } catch (error) {
        console.error("Errore gestione like:", error);
        res.status(500).json({ message: "Errore interno del server." });
    }
};

exports.toggleDislike = async (req, res) => {
    try {
        const memeId = req.params.id;
        const userId = req.user.id;

        const existingDislike = await Dislike.findOne({ where: { MemeId: memeId, UserId: userId } });

        if (existingDislike) {
            await existingDislike.destroy();
            res.status(200).json({ status: 'undisliked' });
        } else {
            await Like.destroy({ where: { MemeId: memeId, UserId: userId } });
            await Dislike.create({ MemeId: memeId, UserId: userId });
            res.status(201).json({ status: 'disliked' });
        }
    } catch (error) {
        console.error("Errore gestione dislike:", error);
        res.status(500).json({ message: "Errore interno del server." });
    }
};

exports.addComment = async (req, res) => {
    try {
        const comment = await Comment.create({
            text: req.body.text,
            MemeId: req.params.id,
            UserId: req.user.id
        });
        res.status(201).json(comment);
    } catch (error) {
        console.error("Errore aggiunta commento:", error);
        res.status(500).json({ message: "Errore interno del server." });
    }
};