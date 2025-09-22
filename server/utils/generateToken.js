import jwt from 'jsonwebtoken';
const secretKey = "3832bc07867b1ddc7e12edf237dcf71a01bdd637c8b2f0aeaf84c8e009be697baa326889bf898ce026eea072a3a1376d5c3ab954a5f53996ea10fc3139de787e"

export const generateToken = (user) => {
  return jwt.sign({email: user.email, id:user._id}, secretKey)
}