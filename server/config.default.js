module.exports = {
  environment: process.env.ENVIRONMENT || 'development',

  slugs: process.env.SLUGS,

  forceHttps: process.env.FORCE_HTTPS ? JSON.parse(process.env.FORCE_HTTPS) : false,
  forceWww: process.env.FORCE_WWW ? JSON.parse(process.env.FORCE_WWW) : false,

  basePath: process.env.BASE_PATH || '/',

  session: {
    secret: process.env.SESSION_SECRET,
    ttl: process.env.SESSION_TTL || 7200,
  },

  auth0: {
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
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
