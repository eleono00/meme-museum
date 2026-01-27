const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // 1. Cerca il token nell'intestazione
    const token = req.header('Authorization');

    // 2. Se non c'è, blocca tutto
    if (!token) return res.status(401).json({ message: 'Accesso negato. Manca il token.' });

    try {
        // 3. Verifica la validità (deve coincidere con la parola segreta del Login)
        const verified = jwt.verify(token, 'segreto_super_segreto');
        req.user = verified;
        next(); // Tutto ok, prosegui
    } catch (err) {
        res.status(400).json({ message: 'Token non valido.' });
    }
};