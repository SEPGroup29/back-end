const mongoose = require('mongoose');
const bcrypt = require('bcryptjs') 
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    user: {
      type: Schema.Types.ObjectId, ref: 'User'
    },
    password:{
        type: String,
        required: true
    }
})

// static signup method
adminSchema.statics.signup = async function(email, password, userType) {

    //validation
    // if (!email || !password) {
    //   return({error:'All fields must be filled'})
    // }
    // if (!validator.isEmail(email)) {
    //   return({error:'Email not valid'})
    // }
    // if (!validator.isStrongPassword(password)) {
    //   return({error:'Password not strong enough'})
    // }
  
    const exists = await this.findOne({ email })
  
    if (exists) {
      return({error:'Email already in use'})
    }
  
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
  
    const admin = await this.create({ email, password: hash, userType: userType._id })
  
    return admin
  }

// static login method
adminSchema.statics.login = async function(email, password) {

    if (!email || !password) {
      return({error:'All fields must be filled'})
    }
  
    const admin = await this.findOne({ email }).populate('userType')
    if (!admin) {
      return({error: 'Incorrect email'})
    }
  
    const match = await bcrypt.compare(password, admin.password)
    if (!match) {
      return({error: 'Incorrect password'})
    }
  
    return admin
  }


const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;