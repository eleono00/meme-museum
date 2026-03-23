const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Chiave segreta (In produzione dovrebbe stare in un file .env)
const JWT_SECRET = 'segreto_super_sicuro'; 

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // 1. Verifica se l'utente esiste già
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email già registrata." });
        }

        // 2. Hashing della password (Sicurezza)
        // Il numero 10 indica i "salt rounds" (costo computazionale)
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 3. Creazione utente nel Database
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

        // 1. Cerca l'utente nel Database
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "Utente non trovato." });
        }

        // 2. Confronta la password inserita con l'hash nel DB
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: "Credenziali non valide." });
        }

        // 3. Genera il Token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email }, // Payload (dati dentro il token)
            JWT_SECRET,                         // Chiave segreta per la firma
            { expiresIn: '1h' }                 // Scadenza
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