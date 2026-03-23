const jwt = require('jsonwebtoken');

const JWT_SECRET = 'segreto_super_sicuro'; // da nascondere nel caso in cui lo rendessimo pubblico

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    // Formato standard: "Bearer <token>"
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden
        }
        
        req.user = user; // Allega il payload dell'utente alla richiesta
        next();
    });
};

module.exports = { authenticateToken };