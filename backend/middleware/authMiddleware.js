const jwt = require('jsonwebtoken');

const JWT_SECRET = 'segreto_super_sicuro'; 

const authenticateToken = (req, res, next) => {

    // Cerco l'header "Authorization" nella richiesta in arrivo dal frontend
    const authHeader = req.headers['authorization'];
    
    // Prendo solo la seconda parte
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.sendStatus(401); // Unauthorized
    }

    // Se c'è un token, verifico che sia valido e che non sia stato manomesso
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); 
        }
        
        req.user = user; 
        next();
    });
};

module.exports = { authenticateToken };