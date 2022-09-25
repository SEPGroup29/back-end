const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = 4000;

require('dotenv').config();

app.use(cors());
app.use(bodyParser.json());

const mongoose = require('mongoose');
const uri = process.env.MONGO_URI

const connectionParams = {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
}


mongoose.connect(uri, connectionParams)
    .then( () => {
        console.log('Connected to database')
        app.listen(PORT, function() {
            console.log("Server is running on Port: " + PORT);
        });
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. \n${err}`);
    })

