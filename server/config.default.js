module.exports = {
  environment: process.env.ENVIRONMENT || 'development',

  pageTitle: process.env.PAGE_TITLE || 'ACE CMS',

  maintenance: process.env.MAINTENANCE ? JSON.parse(process.env.MAINTENANCE) : false,

  forceHttps: process.env.FORCE_HTTPS ? JSON.parse(process.env.FORCE_HTTPS) : false,
  forceWww: process.env.FORCE_WWW ? JSON.parse(process.env.FORCE_WWW) : false,

  routerBasePath: process.env.ROUTER_BASE_PATH || '/',
  clientBasePath: process.env.CLIENT_BASE_PATH || '/',

  api: {
    url: process.env.API_URL || '/api',
  },

  auth: {
    tokenSecret: process.env.AUTH_TOKEN_SECRET || 'change_me',
    tokenExpiresIn: parseInt(process.env.AUTH_TOKEN_EXPIRES_IN || 86400, 10),
  },

  dev: {
    userId: process.env.DEV_USER_ID || 'dev',
    role: process.env.DEV_ROLE || 'super',
  },

  session: {
    secret: process.env.SESSION_SECRET || 'change_me',
    ttl: parseInt(process.env.SESSION_TTL || 7200, 10),
  },

  auth0: {
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackUrl: process.env.AUTH0_CALLBACK_URL,
  },

  assist: {
    url: process.env.ASSIST_URL || '',
    username: process.env.ASSIST_USERNAME || '',
    password: process.env.ASSIST_PASSWORD || '',
  },
};
