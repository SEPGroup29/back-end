const express = require('express')
require('dotenv').config();

const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// Connect DB & start server
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

// Auth routes
app.use('/auth', require('./routes/auth'))

//API routes
    // Enter API routes here