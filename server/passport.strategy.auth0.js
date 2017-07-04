const passport = require('passport');
const Auth0Strategy = require('passport-auth0');

module.exports = (config) => {
  const strategy = new Auth0Strategy({
    domain: config.auth0.domain,
    clientID: config.auth0.clientId,
    clientSecret: config.auth0.clientSecret,
    callbackURL: `${config.basePath}login`,
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

  return strategy;
};
