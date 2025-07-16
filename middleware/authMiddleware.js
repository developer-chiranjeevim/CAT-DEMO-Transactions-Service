
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Access token missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECERT_KEY);
        req.user = decoded.sub; 

        next();
    } catch (error) {
        res.status(403).json({ error: "Invalid or expired token" });
    }
};

module.exports = authenticateToken;
