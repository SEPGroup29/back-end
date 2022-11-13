const express = require('express')
require('dotenv').config();
const cookieParser = require('cookie-parser');

const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = process.env.PORT || 4000;

const corsOptions ={
    origin:'http://localhost:3000', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}

app.use(cors(corsOptions));
app.use(bodyParser.json());

// cookie parser middleware
app.use(cookieParser());

// Connect DB & start server
const mongoose = require('mongoose');
const verifyJWT = require('./middlewares/verifyJWT');
const uri = process.env.MONGO_URI

const connectionParams = {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
}


// Auth routes
app.use('/auth', require('./routes/auth'))

//API routes
app.use('/api/vehicle-owner', verifyJWT, require('./routes/api/vehicle_owner'))
app.use('/api/fuel-station', verifyJWT, require('./routes/api/fuel_station'))

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