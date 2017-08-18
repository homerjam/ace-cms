const _ = require('lodash');
const express = require('express');
const fs = require('fs');
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

const AceApi = require('ace-api');
const AceApiServer = require('ace-api-server');

const packageJson = require('../package.json');
const defaultConfig = require('./config.default');
const defaultApiConfig = require('ace-api/config.default');

const VERSION = packageJson.version;
const API_TOKEN_EXPIRES_IN = 7200;

/* App */

class AceCms {
  constructor (app, config, apiConfig) {
    config = _.merge({}, defaultConfig, config);
    apiConfig = _.merge({}, defaultApiConfig, apiConfig);

    app.use(helmet());
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

    if (config.environment === 'development') {
      app.use(session({
        secret: config.session.secret,
        resave: true,
        saveUninitialized: true,
      }));

    } else {
      app.use(session({
        store: new RedisStore({
          host: config.redis.host,
          port: config.redis.port,
          ttl: config.session.ttl,
          pass: config.redis.password,
        }),
        secret: config.session.secret,
        resave: true,
        saveUninitialized: true,
      }));
    }

    /* Passport */

    require('./passport.strategy.auth0')(config);
    app.use(passport.initialize());
    app.use(passport.session());

    /* Auth */

    const authMiddleware = (req, res, next) => {
      const slug = req.params.slug;

      req.session.referer = req.originalUrl;

      if (config.environment === 'development') {
        const jwt = new AceApi.Jwt(apiConfig);

        req.session.apiToken = jwt.signToken({
          slug,
          userId: apiConfig.dev.userId,
          role: apiConfig.dev.role,
        });

        next();
        return;
      }

      if (req.isAuthenticated()) {
        next();
        return;
      }

      if (req.xhr || (req.headers.accept && /json/i.test(req.headers.accept))) {
        res.status(401);
        res.send({
          code: 401,
          message: 'Not authorised',
        });
        return;
      }

      const querystring = Object.keys(req.query).length ? `?${qs.stringify(req.query)}` : '';

      res.redirect(`${config.clientBasePath + slug}/login${querystring}`);
    };

    app.get(`${config.routerBasePath}authorise`, (req, res) => {
      if (!req.query.code) {
        res.redirect(config.clientBasePath);
        return;
      }

      const slug = JSON.parse(req.query.state).slug;

      const authenticate = passport.authenticate('auth0', { failureRedirect: `${config.clientBasePath + slug}/login` });

      authenticate(req, res, (error) => {
        if (error) {
          res.status(error.status);
          res.send(error);
          return;
        }

        const userId = req.user.emails[0].value; // TODO: Replace email as userId?

        const auth = new AceApi.Auth(apiConfig);

        auth.authoriseUser(slug, userId)
          .then((user) => {
            // req.session.accessToken = req.authInfo.access_token;
            // req.session.idToken = req.authInfo.id_token;

            const payload = {
              userId,
              slug,
              role: user.role,
            };

            // _.merge(req.session, payload);

            const jwt = new AceApi.Jwt(apiConfig);

            const apiToken = jwt.signToken(payload, {
              expiresIn: API_TOKEN_EXPIRES_IN,
            });

            req.session.apiToken = apiToken;

            res.redirect(config.clientBasePath + slug);
          })
          .catch((reason) => {
            console.error(reason);

            req.session.errorMessage = reason.toString();

            res.redirect(`${config.clientBasePath + slug}/login`);
          });
      });
    });

    /* Register API Server */

    const apiRouter = express.Router();

    app.use(`${config.apiRouterPath}`, apiRouter);

    AceApiServer(apiRouter, apiConfig, authMiddleware);

    /* Router */

    const router = express.Router({ mergeParams: true });

    app.use(`${config.routerBasePath}:slug/`, router);

    /* Static */

    router.use(express.static(path.resolve(__dirname, '../public')));

    if (fs.existsSync(path.resolve(__dirname, '../node_modules'))) {
      router.use('/angular-i18n', express.static(path.resolve(__dirname, '../node_modules/angular-i18n')));
    } else {
      router.use('/angular-i18n', express.static(path.resolve(__dirname, '../../angular-i18n')));
    }

    /* Force https */

    const forceHttps = (req, res, next) => {
      if (
        (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https') &&
        (req.headers['cf-visitor'] && JSON.parse(req.headers['cf-visitor']).scheme !== 'https') // Fix for Cloudflare/Heroku flexible SSL
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

    router.get('/login', (req, res) => {
      const slug = req.params.slug;

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
      };

      req.session.errorMessage = null;
      req.session.successMessage = null;

      AceApi.Db.connect(apiConfig, slug).getAsync('config')
        .then(
          (config) => {
            data.client = config.client;
            res.render('login', data);
          },
          (error) => {
            data.errorMessage = `Client not found: ${slug}`;
            res.render('login', data);
          }
        );
    });

    router.post('/logout', (req, res) => {
      req.logout();
      req.session.destroy(() => {
        res.status(200);
        res.send('Logged out successfully');
      });
    });

    router.get('/logout', (req, res) => {
      const slug = req.params.slug;
      req.logout();
      req.session.destroy(() => {
        res.redirect(`${config.clientBasePath + slug}/login?success=logout`);
      });
    });

    /* Index */

    let assistCredentials = new Buffer(`${config.assist.username}:${passwordHash.generate(config.assist.password)}`);
    assistCredentials = assistCredentials.toString('base64');

    function index (req, res) {
      const slug = req.params.slug;

      res.render('index', {
        slug,
        clientBasePath: config.clientBasePath,
        environment: config.environment,
        version: VERSION,
        assistUrl: config.assist.url,
        assistCredentials,
        apiUrl: config.apiUrl,
        apiToken: req.session.apiToken,
        session: req.session,
      });
    }

    router.use(authMiddleware, (req, res) => {
      // if (req.headers.accept && req.headers.accept.indexOf('application/json') > -1) {
      //   res.status(404);
      //   res.send('Not found');
      //   return;
      // }

      index(req, res);
    });

    return app;
  }
}

module.exports = AceCms;
