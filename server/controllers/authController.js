const userModel = require('../models/user-model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../utils/generateToken');

module.exports.registerUser = async(req, res) => {
  try{
    let {name, email, password, confirmPassword} = req.body;
  }catch(err){
    console.log("Error: "+err);
  }
}