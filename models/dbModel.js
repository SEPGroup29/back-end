require('dotenv').config();

const mongoose = require('mongoose');
const uri = process.env.MONGO_URI

const connectionParams = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}

mongoose.connect(uri, connectionParams)
    .then( () => {
        console.log('Connected to database')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. \n${err}`);
    })
