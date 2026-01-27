const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {

    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            return res.status(400).json({ message: "Email già in uso!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

         const newUser = await User.create({
            username,
            email,
            password: hashedPassword
        });
       
        res.status(201).json({ message: "Utente registrato con successo!", user: newUser.username });

    } catch (error) {
        console.error(" ERRORE CRITICO REGISTRAZIONE:", error); 
        res.status(500).json({ message: "Errore del server", error: error.message });
    }    
};

exports.login = async (req, res) => {
    console.log("🔑 [1] TENTATIVO LOGIN. Dati ricevuti:", req.body);

    try {
        const { email, password } = req.body;

        // STEP 2: Cerchiamo l'email nel database
        console.log(`🔑 [2] Cerco l'utente con email: '${email}'...`);
        const user = await User.findOne({ where: { email } });
        
        console.log("🔑 [3] Utente trovato?", user ? "SÌ (ID: " + user.id + ")" : "NO (Nessuno)");

        if (!user) {
            console.log(" STOP: Utente non trovato.");
            return res.status(404).json({ message: "Utente non trovato" });
        }

        // STEP 4: Controlliamo la password
        console.log("🔑 [4] Controllo la password...");
        // user.password è quella criptata ($2b$...), password è "123456"
        const isMatch = await bcrypt.compare(password, user.password);

        console.log("🔑 [5] Password corretta?", isMatch ? "SÌ ✅" : "NO ❌");

        if (!isMatch) {
            console.log(" STOP: Password errata.");
            return res.status(401).json({ message: "Password errata" });
        }

        // STEP 6: Generiamo il pass (Token)
        const token = jwt.sign({ id: user.id }, 'segreto_super_segreto', { expiresIn: '1h' });
        console.log("🔑 [6] LOGIN RIUSCITO! Token generato.");

        res.status(200).json({ token, user: user.username });

    } catch (error) {
        console.error(" ERRORE CRITICO LOGIN:", error);
        res.status(500).json({ message: "Errore del server" });
    }
};