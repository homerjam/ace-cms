module.exports = {
  environment: process.env.ENVIRONMENT || 'development',

  pageTitle: process.env.PAGE_TITLE || 'ACE CMS',

  forceHttps: process.env.FORCE_HTTPS ? JSON.parse(process.env.FORCE_HTTPS) : false,
  forceWww: process.env.FORCE_WWW ? JSON.parse(process.env.FORCE_WWW) : false,

  routerBasePath: process.env.ROUTER_BASE_PATH || '/',
  clientBasePath: process.env.CLIENT_BASE_PATH || '/',

  apiRouterPath: process.env.API_ROUTER_PATH || '/api',
  apiUrl: process.env.API_URL || '/api',

  session: {
    secret: process.env.SESSION_SECRET,
    ttl: process.env.SESSION_TTL,
  },

  auth0: {
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackUrl: process.env.AUTH0_CALLBACK_URL,
  },

  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },

  assist: {
    url: process.env.ASSIST_URL || '',
    username: process.env.ASSIST_USERNAME || '',
    password: process.env.ASSIST_PASSWORD || '',
  },
};
