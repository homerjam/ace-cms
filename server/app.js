const _ = require('lodash');
const express = require('express');
const fs = require('fs');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cookieSession = require('cookie-session');
const compression = require('compression');
const errorHandler = require('errorhandler');
const passwordHash = require('password-hash');
const qs = require('querystring');
const helmet = require('helmet');
const useragent = require('express-useragent');
const passport = require('passport');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const packageJson = require('../package.json');
const defaultConfig = require('./config.default');

const VERSION = packageJson.version;

/* App */

class AceCms {
  constructor (app, config) {
    config = _.merge({}, defaultConfig, config);

    app.use(helmet());
    app.set('views', `${__dirname}/views`);
    app.set('view engine', 'pug');
    app.use(errorHandler());
    app.use(logger('dev'));
    app.use(cookieParser());
    app.use(bodyParser.json({
      limit: '50mb',
    }));
    app.use(bodyParser.urlencoded({
      extended: true,
      limit: '50mb',
    }));
    app.use(methodOverride());
    app.use(useragent.express());
    app.use(compression());

    /* Maintenance */

    if (config.maintenance) {
      app.use((req, res) => {
        res.render('maintenance', {
          pageTitle: config.pageTitle,
        });
      });
      return app;
    }

    /* Session */

    app.use(cookieSession({
      secret: config.session.secret,
      maxAge: config.session.ttl,
    }));

    /* Passport */

    require('./passport.strategy.auth0')(config);
    app.use(passport.initialize());
    app.use(passport.session());

    /* Async */

    const asyncMiddleware = fn => (req, res, next) => {
      Promise.resolve(fn(req, res, next))
        .catch(next);
    };

    /* Auth */

    const authMiddleware = (req, res, next) => {
      const slug = req.params.slug;

      req.session.referer = req.originalUrl;

      if (config.environment === 'development') {
        if (!req.query.apiToken && !req.headers['x-api-token']) {
          const apiToken = jwt.sign({
            slug,
            userId: config.dev.userId,
            role: config.dev.role,
          }, config.auth.tokenSecret);

          res.redirect(`${config.clientBasePath + slug + req.url}?apiToken=${apiToken}`);
          return;
        }

        next();
        return;
      }

      if (req.isAuthenticated()) {
        next();
        return;
      }

      if (req.xhr || (req.headers.accept && /json/i.test(req.headers.accept))) {
        res.status(401).send({
          code: 401,
          message: 'Not authorised',
          slug,
        });
        return;
      }

      const querystring = Object.keys(req.query).length ? `?${qs.stringify(req.query)}` : '';

      res.redirect(`${config.clientBasePath + slug}/login${querystring}`);
    };

    app.get(`${config.routerBasePath}_authorise`,
      asyncMiddleware(async (req, res) => {
        if (!req.query.code) {
          res.redirect(config.clientBasePath);
          return;
        }

        const slug = req.query.state;

        const authenticate = passport.authenticate('auth0', { failureRedirect: `${config.clientBasePath + slug}/login` });

        authenticate(req, res, async (error) => {
          if (error) {
            res.status(error.status);
            res.send(error);
            return;
          }

          const userId = req.user.emails[0].value; // TODO: Replace email as userId?

          try {
            const user = (await axios.get(`${config.api.url}/auth/user`, {
              params: {
                slug,
                userId,
              },
            })).data;

            if (!user.active) {
              req.session.errorMessage = `User not active (${userId})`;
              res.redirect(`${config.clientBasePath + slug}/login`);
              return;
            }

            const payload = {
              userId,
              slug,
              role: user.role,
            };

            const apiToken = jwt.sign(payload, config.auth.tokenSecret, {
              expiresIn: config.auth.tokenExpiresIn,
            });

            res.redirect(`${config.clientBasePath + slug}?apiToken=${apiToken}`);

          } catch (error) {
            console.error(error);

            req.session.errorMessage = error.toString();
            res.redirect(`${config.clientBasePath + slug}/login`);
          }
        });
      })
    );

    /* Auth Redirect */

    app.get(`${config.routerBasePath}_auth/:provider`, (req, res) => {
      res.status(req.query.error ? 500 : 200);
      res.send(`${req.params.provider}: ${(req.query.error_description ? req.query.error_description : 'successfully authenticated')}`);
    });

    /* Router */

    const router = express.Router({ mergeParams: true });

    app.use(`${config.routerBasePath}:slug/`, router);

    /* Static */

    router.use(express.static(path.resolve(__dirname, '../public')));

    /* Force https */

    const forceHttps = (req, res, next) => {
      if (
        (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https')
        && (req.headers['cf-visitor'] && JSON.parse(req.headers['cf-visitor']).scheme !== 'https') // Fix for Cloudflare/Heroku flexible SSL
      ) {
        res.redirect(301, `https://${req.headers.host}${req.path}`);
        return;
      }
      next();
    };

    if (config.environment === 'production' && config.forceHttps === true) {
      app.enable('trust proxy');
      router.use(forceHttps);
    }

    /* Force www */

    const forceWww = (req, res, next) => {
      const hostParts = req.headers.host.split('.');
      if (hostParts[0] !== 'www') {
        res.redirect(301, `${req.protocol}://www.${req.headers.host}${req.originalUrl}`);
        return;
      }
      next();
    };

    if (config.environment === 'production' && config.forceWww === true) {
      router.use(forceWww);
    }

    /* Routes */

    const auth = (type, req, res) => {
      const slug = req.params.slug;

      const messages = {};

      let errorMessage = req.session.errorMessage || false;
      let successMessage = req.session.successMessage || false;

      if (req.query.error) {
        errorMessage = messages[req.query.error] ? messages[req.query.error] : false;
      }

      if (req.query.success) {
        successMessage = messages[req.query.success] ? messages[req.query.success] : false;
      }

      const data = {
        type,
        slug,
        clientBasePath: config.clientBasePath,
        environment: config.environment,
        version: VERSION,
        forceHttps: config.forceHttps,
        errorMessage,
        successMessage,
        auth0: {
          clientId: config.auth0.clientId,
          domain: config.auth0.domain,
        },
        pageTitle: config.pageTitle,
      };

      req.session.errorMessage = null;
      req.session.successMessage = null;

      axios.get(`${config.api.url}/config/info`, {
        params: {
          slug,
        },
      })
        .then(
          (result) => {
            data.client = result.data.client;
            res.render('auth', data);
          },
          (error) => {
            data.errorMessage = `Account ID not found: ${slug}`;
            res.render('auth', data);
          }
        );
    };

    router.get('/signup', auth.bind(app, 'signup'));

    router.get('/login', auth.bind(app, 'login'));

    router.post('/logout', (req, res) => {
      req.logout();
      req.session = null;
      res.status(200);
      res.send('Logged out successfully');
    });

    router.get('/logout', (req, res) => {
      const slug = req.params.slug;
      req.logout();
      req.session = null;
      res.redirect(`${config.clientBasePath + slug}/login?success=logout`);
    });

    /* Index */

    let appStyles = fs.readdirSync(path.resolve(__dirname, '../public/build/css'));
    appStyles = appStyles.filter(script => /\.css$/.test(script)).sort().reverse();

    let appScripts = fs.readdirSync(path.resolve(__dirname, '../public/build/js'));
    appScripts = appScripts.filter(script => /\.js$/.test(script)).sort().reverse();

    let assistCredentials = Buffer.from(`${config.assist.username}:${passwordHash.generate(config.assist.password)}`);
    assistCredentials = assistCredentials.toString('base64');

    function index (req, res) {
      const { slug } = req.params;
      const { apiToken } = req.query;

      res.render('index', {
        environment: config.environment,
        version: VERSION,
        clientBasePath: config.clientBasePath,
        pageTitle: config.pageTitle,
        slug,
        session: req.session,
        apiUrl: config.api.url,
        apiToken,
        assistUrl: config.assist.url,
        assistCredentials,
        auth0: {
          clientId: config.auth0.clientId,
          domain: config.auth0.domain,
        },
        appStyles,
        appScripts,
      });
    }

    router.use(authMiddleware, index);

    return app;
  }
}

module.exports = AceCms;
