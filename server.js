const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.get("/", (request, response) => {
    response.json({message: "server is running"}).status(200);
});

app.listen(PORT, (error) => {
    if(error){
        console.log(error.message);
    }else{
        console.log("SERVER STARTED ON PORT 8080");
    };
});