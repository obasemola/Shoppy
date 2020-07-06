const express = require('express');
const parsingHelp = require('body-parser');
const cookieSession = require('cookie-session');
const authRouter = require('./routes/Admin/auth');

const app = express();

app.use(parsingHelp.urlencoded({ extended: true }));
app.use(cookieSession({
  keys: ['jghbkjdbghjkjnjgxxdxhlkhbjhbhmb']
})
);

app.use(authRouter);

app.listen(3000, () => {
  console.log('Listening');
});