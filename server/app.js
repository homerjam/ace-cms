const express = require('express');
const http = require('http');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const compression = require('compression');
const errorHandler = require('errorhandler');
const passwordHash = require('password-hash');
const qs = require('querystring');
const RedisStore = require('connect-redis')(session);
const helmet = require('helmet');
const useragent = require('express-useragent');
const passport = require('passport');
const env = require('node-env-file');

if (!process.env.ENVIRONMENT) {
  env('.env');
}

const AceApi = require('ace-api');
// const AceApi = require('../../ace-api');

const packageJson = require('../package.json');
const apiDefaultConfig = require('./api.default.config');

const ENVIRONMENT = process.env.ENVIRONMENT || 'development';
const VERSION = packageJson.version;
const SLUGS = process.env.SLUGS || '';
const SESSION_SECRET = process.env.SESSION_SECRET || '';
const FORCE_HTTPS = process.env.FORCE_HTTPS ? JSON.parse(process.env.FORCE_HTTPS) : false;
const FORCE_WWW = process.env.FORCE_WWW ? JSON.parse(process.env.FORCE_WWW) : false;

const BASE_PATH = process.env.BASE_PATH || '/';

const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID || '';
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || '';

const DEV_EMAIL = process.env.DEV_EMAIL || '';
const DEV_SLUG = process.env.DEV_SLUG || '';
const DEV_ROLE = process.env.DEV_ROLE || '';
const DEV_SUPER_USER = process.env.DEV_SUPER_USER ? JSON.parse(process.env.DEV_SUPER_USER) : false;

const REDIS_HOST = process.env.REDIS_HOST || '';
const REDIS_PORT = process.env.REDIS_PORT || '';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';

const ASSIST_URL = process.env.ASSIST_URL || '';
const ASSIST_USERNAME = process.env.ASSIST_USERNAME || '';
const ASSIST_PASSWORD = process.env.ASSIST_PASSWORD || '';

/* App */

class AceCms {
  constructor (app, config) {
    const apiConfig = config || apiDefaultConfig;

    app.use(helmet());
    app.set('trust proxy', true);
    app.set('views', `${__dirname}/views`);
    app.set('view engine', 'ejs');
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

    /* Session */

    if (ENVIRONMENT !== 'production') {
      app.use(session({
        secret: SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
      }));
    } else {
      app.use(session({
        store: new RedisStore({
          host: REDIS_HOST,
          port: REDIS_PORT,
          ttl: 3600,
          pass: REDIS_PASSWORD,
        }),
        secret: SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
      }));
    }

    /* Passport */

    require('./auth0.strategy');
    app.use(passport.initialize());
    app.use(passport.session());

    /* Router */

    const router = express.Router();
    app.use(`${BASE_PATH}`, router);

    /* Static */

    router.use(express.static(path.join(__dirname, '..', 'public')));
    router.use('/angular-i18n', express.static(path.join(__dirname, '..', 'node_modules', 'angular-i18n')));

    /* Force https */

    const forceHttps = (req, res, next) => {
      if (/Prerender|PhantomJS/i.test(req.headers['user-agent'] || '')) {
        next();
        return;
      }
      if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https') {
        res.redirect(301, `https://${req.headers.host}${req.path}`);
        return;
      }
      next();
    };

    if (ENVIRONMENT === 'production' && FORCE_HTTPS === true) {
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

    if (ENVIRONMENT === 'production' && FORCE_WWW === true) {
      router.use(forceWww);
    }

    /* Auth */

    const ensureAuthenticated = (req, res, next) => {
      if (!req.session) {
        return res.status(500).send('Session not initialised, please refresh');
      }

      req.session.referer = req.originalUrl;

      const querystring = Object.keys(req.query).length ? `?${qs.stringify(req.query)}` : '';

      if (ENVIRONMENT !== 'production') {
        if (!req.session.slug) {
          req.session.slug = DEV_SLUG;
        }
        req.session.email = DEV_EMAIL;
        req.session.role = DEV_ROLE;
        req.session.superUser = DEV_SUPER_USER;

        req.session.userAuthorised = true;

        return next();
      }

      if (req.isAuthenticated() && req.session.email) {
        req.session.userAuthorised = true;

        return next();
      }

      if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
        return res.status(401).send('Not authorised');
      }

      return res.redirect(`${BASE_PATH}login${querystring}`);
    };

    /* Register API */

    apiConfig._app = app;
    apiConfig._router = router;
    apiConfig._ensureAuthenticated = ensureAuthenticated;

    const aceApi = AceApi(apiConfig);

    /* Verify */

    const verifyUser = (req, res, next) => {
      if (!req.query.code) {
        next();
        return;
      }

      const authenticate = passport.authenticate('auth0', { failureRedirect: `${BASE_PATH}login` });

      authenticate(req, res, (error) => {
        if (error) {
          res.status(error.status).send(error);
          return;
        }

        const email = req.user.emails[0].value;

        const auth = new aceApi.Auth(null, apiConfig);

        auth.authoriseUser(email, req)
          .then((user) => {
            req.session.accessToken = req.query.access_token;
            req.session.idToken = req.query.id_token;

            if (!req.session.email) {
              req.session.email = email;
            }

            if (!req.session.slug && user.slug) {
              req.session.slug = user.slug;
            }

            req.session.role = user.role;
            req.session.superUser = user.superUser || false;

            res.redirect(BASE_PATH);
          }, (reason) => {
            console.error(reason);

            req.session.errorMessage = reason;

            res.redirect(`${BASE_PATH}login`);
          });
      });
    };

    /* Routes */

    router.get('/login', verifyUser, (req, res) => {
      const messages = {
        logout: 'Logged out successfully',
      };

      let errorMessage = req.session.errorMessage || false;
      let successMessage = req.session.successMessage || false;

      if (req.query.error) {
        errorMessage = messages[req.query.error] ? messages[req.query.error] : false;
      }

      if (req.query.success) {
        successMessage = messages[req.query.success] ? messages[req.query.success] : false;
      }

      const data = {
        basePath: BASE_PATH,
        environment: ENVIRONMENT,
        version: VERSION,
        forceHttps: FORCE_HTTPS,
        errorMessage,
        successMessage,
        auth0: {
          clientId: AUTH0_CLIENT_ID,
          domain: AUTH0_DOMAIN,
        },
      };

      req.session.errorMessage = req.session.successMessage = null;

      res.render('login', data);
    });

    router.post('/logout', (req, res) => {
      req.logout();
      req.session.destroy(() => {
        res.status(200).send('Logged out successfully');
      });
    });

    router.get('/logout', (req, res) => {
      req.logout();
      req.session.destroy(() => {
        res.redirect(`${BASE_PATH}?success=logout`);
      });
    });

    router.get('/switch', ensureAuthenticated, (req, res) => {
      if (req.session.superUser || ENVIRONMENT === 'development') {
        if (req.query.slug) {
          req.session.slug = req.query.slug;

          if (req.session.referer && req.session.referer.indexOf('/switch') === -1) {
            return res.redirect(req.session.referer);
          }

          return res.redirect(BASE_PATH);
        }

        return res.render('switch', {
          basePath: BASE_PATH,
          environment: ENVIRONMENT,
          version: VERSION,
          slugs: SLUGS.split(','),
        });
      }

      return res.redirect(`${BASE_PATH}logout`);
    });

    /* Index */

    let assistCredentials = new Buffer(`${ASSIST_USERNAME}:${passwordHash.generate(ASSIST_PASSWORD)}`);
    assistCredentials = assistCredentials.toString('base64');

    function index (req, res) {
      res.render('index', {
        basePath: BASE_PATH,
        environment: ENVIRONMENT,
        version: VERSION,
        assistUrl: ASSIST_URL,
        assistCredentials,
        apiPrefix: apiConfig.apiPrefix,
        session: req.session,
      });
    }

    router.use(ensureAuthenticated, (req, res) => {
      if (req.headers.accept && req.headers.accept.indexOf('application/json') > -1) {
        res.status(404).send('Not found');
        return;
      }

      if (!req.session.slug) {
        res.redirect(`${BASE_PATH}switch`);
        return;
      }

      index(req, res);
    });

    return app;
  }
}

module.exports = AceCms;
