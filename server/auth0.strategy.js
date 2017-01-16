const passport = require('passport');
const Auth0Strategy = require('passport-auth0');

const BASE_PATH = process.env.BASE_PATH || '/';

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || '';
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID || '';
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET || '';

const strategy = new Auth0Strategy({
  domain: AUTH0_DOMAIN,
  clientID: AUTH0_CLIENT_ID,
  clientSecret: AUTH0_CLIENT_SECRET,
  callbackURL: `${BASE_PATH}login`,
}, (accessToken, refreshToken, extraParams, profile, done) =>
// accessToken is the token to call Auth0 API (not needed in the most cases)
// extraParams.id_token has the JSON Web Token
// profile has all the information from the user
done(null, profile));

passport.use(strategy);

// This is not a best practice, but we want to keep things simple for now
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = strategy;
