const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Chiave segreta da nascondere
const JWT_SECRET = 'segreto_super_sicuro'; 

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Verifico se l'utente esiste già
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email già registrata." });
        }

        //  Hashing password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Creazione utente nel Database
        const user = await User.create({ 
            username, 
            email, 
            password: hashedPassword 
        });

        // Restituisce 201 (Created)
        res.status(201).json({ message: "Utente registrato con successo." });

    } catch (error) {
        console.error("Errore durante la registrazione:", error);
        res.status(500).json({ message: "Errore interno del server." });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Cerco l'utente nel Database
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "Utente non trovato." });
        }

        // Confronto la password inserita con l'hash nel DB
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: "Credenziali non valide." });
        }

        // Genero il Token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            JWT_SECRET,                         
            { expiresIn: '1h' }               
        );

        res.status(200).json({ 
            token, 
            user: { id: user.id, username: user.username, email: user.email } 
        });

    } catch (error) {
        console.error("Errore durante il login:", error);
        res.status(500).json({ message: "Errore interno del server." });
    }
};