const express = require('express');
const parsingHelp = require('body-parser');
const cookieSession = require('cookie-session');
const usersRepo = require('./repositories/users');

const app = express();

app.use(parsingHelp.urlencoded({ extended: true }));
app.use(cookieSession({
  keys: ['jghbkjdbghjkjnjgxxdxhlkhbjhbhmb']
}))

app.get('/', (req, res) => {
  res.send(
    `
    <div>
      ${req.session.userId}
      <form method="POST">
        <input name="email" placeholder="email" />
        <input name="password" placeholder="password" />
        <input name="passwordConfirmation" placeholder="password confirmation" />
        <button>Sign Up</button>
      </form>
    </div>
    
    `
  );
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

app.post('/', async (req, res) => {
  const { email, password, passwordConfirmation } = req.body

  const existingUser = await usersRepo.getOneBy({ email });
  if(existingUser) {
    return res.send('Email in use');
  }

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


app.listen(3000, () => {
  console.log('Listening');
});