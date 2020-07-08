const express = require('express');
const usersRepo = require('../../repositories/users');
const signupTemplate = require('../../views/admin/auth/signup');
const signinTemplate = require('../../views/admin/auth/signin');
const { check, validationResult } = require('express-validator');
const {
  requireEmail,
  requirePassword,
  requirePasswordConfirmation,
  requireEmailExists,
  requireValidPasswordForUser } = require('./validators');

const router = express.Router();

router.get('/signup', (req, res) => {
  res.send(signupTemplate({ req: req }));
});

//Writing a parser instead of using an off-the-shelf library
// const parsingHelp = (req, res, next) => {
//   if(req.method === 'POST') {
//     req.on('data', (data) => {
//       const parsed = data.toString('utf8').split('&');
//       const formData = {};
//       for(let pair of parsed) {
//         const [key, value] = pair.split('=');
//         formData[key] = value;
//       }
//       req.body = formData;
//       next();
//     });  
//   } else {
//     next();
//   }
// };

router.post(
  '/signup',
  [
    requireEmail,
    requirePassword,
    requirePasswordConfirmation    
  ],

  async (req, res) => {
    const errors = validationResult(req);
    
    if(!errors.isEmpty()) {
      return res.send(signupTemplate({ req, errors }));
    }

    const { email, password, passwordConfirmation } = req.body

    //Authentication
    //First, create a user in our user repo to represent the new user
    const user = await usersRepo.create({ email: email, password: password })
    //Then store the id of the user inside the users cookie
    req.session.userId = user.id;

    res.send('Account created!')
});

router.get('/signout', (req, res) => {
  req.session = null;
  res.send('You are logged out');
});

router.get('/signin', (req, res) => {
    res.send(signinTemplate());
  });

router.post('/signin', [
  requireEmailExists,
  requireValidPasswordForUser
  ],
  async (req, res) => {
    const errors = validationResult(req);
    console.log(errors);

    const { email } = req.body;

    const user = await usersRepo.getOneBy({ email });
    
    
    req.session.userId = user.id;
    res.send('You are signed in');
  });


module.exports = router;