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

const Api = require('ace-api');
// const ApiServer = require('ace-api-server');

const packageJson = require('../package.json');
const defaultConfig = require('./config.default');

const VERSION = packageJson.version;
const API_TOKEN_EXPIRES_IN = 86400;

/* App */

class AceCms {
  constructor (app, config, apiConfig) {
    config = _.merge({}, defaultConfig, config);
    apiConfig = _.merge({}, Api.defaultConfig, apiConfig);

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

    if (config.environment === 'development') {
      app.use(session({
        secret: config.session.secret,
        resave: true,
        saveUninitialized: true,
      }));

    } else {
      const redisOptions = {
        ttl: config.session.ttl,
      };

      if (config.redis.url) {
        redisOptions.url = config.redis.url;
      } else {
        redisOptions.host = config.redis.host;
        redisOptions.port = config.redis.port;
        redisOptions.password = config.redis.password;
        redisOptions.db = config.redis.db;
      }

      app.use(session({
        store: new RedisStore(redisOptions),
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

      const jwt = Api.Jwt(apiConfig);

      if (config.environment === 'development') {
        if (!req.query.apiToken && !req.headers['x-api-token']) {
          const apiToken = jwt.signToken({
            slug,
            userId: apiConfig.dev.userId,
            role: apiConfig.dev.role,
          });

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

    app.get(`${config.routerBasePath}_authorise`, (req, res) => {
      if (!req.query.code) {
        res.redirect(config.clientBasePath);
        return;
      }

      const slug = req.query.state;

      const authenticate = passport.authenticate('auth0', { failureRedirect: `${config.clientBasePath + slug}/login` });

      authenticate(req, res, (error) => {
        if (error) {
          res.status(error.status);
          res.send(error);
          return;
        }

        const userId = req.user.emails[0].value; // TODO: Replace email as userId?

        const auth = Api.Auth(apiConfig);

        auth.authoriseUser(slug, userId)
          .then((user) => {
            const jwt = Api.Jwt(apiConfig);

            const payload = {
              userId,
              slug,
              role: user.role,
            };

            const apiToken = jwt.signToken(payload, {
              expiresIn: API_TOKEN_EXPIRES_IN,
            });

            res.redirect(`${config.clientBasePath + slug}?apiToken=${apiToken}`);
          })
          .catch((reason) => {
            console.error(reason);

            req.session.errorMessage = reason.toString();

            res.redirect(`${config.clientBasePath + slug}/login`);
          });
      });
    });

    /* Register API Server */

    // const apiRouter = express.Router();
    // app.use(config.api.routerPath, apiRouter);
    // ApiServer(apiRouter, apiConfig, authMiddleware);

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
        pageTitle: config.pageTitle,
      };

      req.session.errorMessage = null;
      req.session.successMessage = null;

      Api.Db(apiConfig, slug).get('config')
        .then(
          (config) => {
            data.client = config.client;
            res.render('login', data);
          },
          (error) => {
            data.errorMessage = `Account ID not found: ${slug}`;
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
