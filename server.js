const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const {Client} = require("pg");

const app = express();
const PORT = process.env.PORT;

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
.catch((error) => console.log(error.message))


app.get("/", (request, response) => {
    response.json({message: "server is running"}).status(200);
});

app.post("/add_transaction", async(request, response) => {
    const transaction_type = request.body.transaction_type;
    const amount = request.body.amount; 
    const query = "INSERT INTO users(transaction_type, amount) VALUES($1, $2)";
    const values = [transaction_type, amount]

    try{
        const res = await client.query(query, values);
        response.json({message: "data added successfully"});

    }catch(error){
        response.json({error: error.message});
    }


});


app.listen(PORT, (error) => {
    if(error){
        console.log(error.message);
    }else{
        console.log("SERVER STARTED ON PORT 8080");
    };
});