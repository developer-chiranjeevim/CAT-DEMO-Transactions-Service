const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const { Client } = require("pg");
const authenticateToken = require("./middleware/authMiddleware");


const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());


const client = new Client({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: process.env.DATABASE_PORT
});

client.connect()
    .then(() => console.log("Database Connected Successfully"))
    .catch((error) => console.log("DB Connection Error:", error.message));


app.get("/", (req, res) => {
    res.status(200).json({ message: "Server is running" });
});
app.post("/add_transaction", async (req, res) => {
    const { user_id, transaction_type, amount } = req.body;

    if (!user_id || !transaction_type || !amount) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
        INSERT INTO transactions (user_id, transaction_type, amount)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const values = [user_id, transaction_type, amount];

    try {
        const result = await client.query(query, values);
        res.status(201).json({ message: "Transaction added", transaction: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get("/transactions", async (req, res) => {
    const query = "SELECT * FROM transactions ORDER BY transaction_time DESC";

    try {
        const result = await client.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.put("/update_transaction/:id", async (req, res) => {
    const transaction_id = req.params.id;
    const { transaction_type, amount } = req.body;

    if (!transaction_type && !amount) {
        return res.status(400).json({ error: "Missing fields to update" });
    }

    let query = "";
    let values = [];

    if (transaction_type && amount) {
        query = `
            UPDATE transactions
            SET transaction_type = $1, amount = $2
            WHERE transaction_id = $3
            RETURNING *;
        `;
        values = [transaction_type, amount, transaction_id];
    } else if (transaction_type) {
        query = `
            UPDATE transactions
            SET transaction_type = $1
            WHERE transaction_id = $2
            RETURNING *;
        `;
        values = [transaction_type, transaction_id];
    } else if (amount) {
        query = `
            UPDATE transactions
            SET amount = $1
            WHERE transaction_id = $2
            RETURNING *;
        `;
        values = [amount, transaction_id];
    }

    try {
        const result = await client.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Transaction not found" });
        }

        res.status(200).json({ message: "Transaction updated", transaction: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete("/delete_transaction/:id", async (req, res) => {
    const transaction_id = req.params.id;

    const query = `DELETE FROM transactions WHERE transaction_id = $1 RETURNING *;`;
    const values = [transaction_id];

    try {
        const result = await client.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Transaction not found" });
        }

        res.status(200).json({ message: "Transaction deleted", transaction: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/my_transactions", authenticateToken, async (req, res) => {
    const userId = req.user;
    console.log(userId)

    const query = "SELECT * FROM transactions WHERE user_id = $1;";
    const values = [userId];

    try {
        const result = await client.query(query, values);
        console.log(result)
        res.status(200).json({ user_id: userId, transactions: result.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, (err) => {
    if (err) {
        console.log("❌ Server Error:", err.message);
    } else {
        console.log(`🚀 Server started on port ${PORT}`);
    }
});
