const express = require('express');
const usersRepo = require('../../repositories/users');
const signupTemplate = require('../../views/admin/auth/signup');
const signinTemplate = require('../../views/admin/auth/signin');
const { check, validationResult } = require('express-validator');

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
    check('email')
      .trim()
      .normalizeEmail()
      .isEmail()
      .withMessage('Must be a valid email')
      .custom(async (email) => {
        const existingUser = await usersRepo.getOneBy({ email });
        if(existingUser) {
          throw new Error('Email in use');
    }
      }

      ),
    check('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Must be between 4 and 20 characters'),
    check('passwordConfirmation')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Must be between 4 and 20 characters')
      .custom((passwordConfirmation, { req }) => {
        if(passwordConfirmation !== req.body.password) {
          throw new Error('Passwords must match');
        }
      })
  ],

  async (req, res) => {
    const errors = validationResult(req);
    console.log(errors)

    const { email, password, passwordConfirmation } = req.body

    

    if (password !== passwordConfirmation) {
      return res.send('Passwords must match!')
    }

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

router.post('/signin', async (req, res) => {
  const { email, password} = req.body;

  const user = await usersRepo.getOneBy({ email });

  if(!user) {
    return res.send('Email not found');
  }

  const validPassword = await usersRepo.comparePasswords(
    user.password,
    password
  );

  if (!validPassword) {
    return res.send('invalid password');
  }
  
  req.session.userId = user.id;
  res.send('You are signed in');
});


module.exports = router;