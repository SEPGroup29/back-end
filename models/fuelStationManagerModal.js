const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt') 

const fuelStationManagerSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    contactNumber: {
        type: Number,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    fuelStationId: {
        type: Schema.Types.String, ref: 'FuelStation'
    },
})

// static signup method
fuelStationManagerSchema.statics.signup = async function(firstName, lastName, contactNumber, email, password, fuelStationId) {

    if (!email || !password) {
        throw Error('All fields must be filled')
      }
      if (!validator.isEmail(email)) {
        throw Error('Email not valid')
      }
      if (!validator.isStrongPassword(password)) {
        throw Error('Password not strong enough')
      }

    const exists = await this.findOne({ email })
  
    if (exists) {
      throw Error('Email already in use')
    }
  
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
  
    const manager = await this.create({ firstName, lastName, contactNumber, email, password: hash, fuelStationId })
  
    return manager
  }

// static login method
fuelStationManagerSchema.statics.login = async function(email, password) {

    if (!email || !password) {
        return({error:'All fields must be filled'})
    }
  
    const manager = await this.findOne({ email })
    if (!manager) {
        return({error: 'Incorrect email'})
    }
  
    const match = await bcrypt.compare(password, manager.password)
    if (!match) {
        return({error: 'Incorrect password'})
    }
  
    return manager
  }

const fuelStationManager = mongoose.model('FuelStationManager', fuelStationManagerSchema);
module.exports = fuelStationManager;