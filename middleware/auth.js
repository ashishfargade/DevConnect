const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config.js');

module.exports = function(req, res, next){
    // Get token from header
    const token = req.header('x-auth-token');
    
    //Check if no token
    if(!token){
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    
    //Decode token
    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Invalid Token' });
        // console.log(err);
        // console.log(jwtSecret);
    }
}