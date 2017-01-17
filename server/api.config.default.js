const env = require('node-env-file');

if (!process.env.ENVIRONMENT) {
  env('.env');
}

const path = require('path');

module.exports = {
  environment: process.env.ENVIRONMENT || 'development',

  debug: process.env.DEBUG || false,
  cache: process.env.CACHE ? JSON.parse(process.env.CACHE) : false,
  forceAuth: process.env.FORCE_AUTH ? JSON.parse(process.env.FORCE_AUTH) : false,

  slug: process.env.SLUG || '',
  baseUrl: process.env.BASE_URL || '',
  basePath: process.env.BASE_PATH || '/',
  apiPrefix: process.env.API_PREFIX || 'api',

  db: {
    url: process.env.DB_URL || '',
    host: process.env.DB_HOST,
    name: process.env.DB_NAME || '',
  },

  auth: {
    dbName: process.env.AUTH_DB_NAME || '',
    superUserId: process.env.AUTH_SUPER_USER_ID || '',
    tokenSecret: process.env.AUTH_TOKEN_SECRET || '',
  },

  dev: {
    email: process.env.DEV_EMAIL || '',
    slug: process.env.DEV_SLUG || '',
    dbName: process.env.DEV_DB_NAME || '',
    role: process.env.DEV_ROLE || '',
    superUser: process.env.DEV_SUPER_USER ? JSON.parse(process.env.DEV_SUPER_USER) : false,
    storeName: process.env.DEV_STORE_NAME,
    senderName: process.env.DEV_SENDER_NAME,
    senderAddress: process.env.DEV_SENDER_ADDRESS,
    stripeAccountId: process.env.DEV_STRIPE_ACCOUNT_ID,
  },

  logentriesToken: process.env.LOGENTRIES_TOKEN,

  assist: {
    url: process.env.ASSIST_URL,
    username: process.env.ASSIST_USERNAME,
    password: process.env.ASSIST_PASSWORD,
  },

  instagram: {
    clientId: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
  },

  twitter: {
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    accessTokenKey: process.env.TWITTER_ACCESS_TOKEN_KEY,
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  },

  google: {
    apisJsonKey: process.env.GOOGLE_APIS_JSON_KEY,
  },

  mailgun: {
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  },

  createsend: {
    apiKey: process.env.CREATESEND_API_KEY,
    clientId: process.env.CREATESEND_CLIENT_ID,
    listId: process.env.CREATESEND_LIST_ID,
  },

  embedly: {
    apiKey: process.env.EMBEDLY_API_KEY,
  },

  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    accessKeySecret: process.env.AWS_ACCESS_KEY_SECRET,

    s3: {
      bucket: process.env.AWS_S3_BUCKET,
    },

    tcode: {
      region: process.env.AWS_TCODE_REGION,
      pipelineId: process.env.AWS_TCODE_PIPELINE_ID,
      bucketIn: process.env.AWS_TCODE_BUCKET_IN,
      bucketOut: process.env.AWS_TCODE_BUCKET_OUT,
    },
  },

  shippo: {
    token: process.env.SHIPPO_TOKEN,
    fromZip: process.env.SHIPPO_FROM_ZIP,
    fromCountry: process.env.SHIPPO_FROM_COUNTRY,
  },

  stripe: {
    clientId: process.env.STRIPE_CLIENT_ID,
    clientSecret: process.env.STRIPE_CLIENT_SECRET,
    apiKey: process.env.STRIPE_API_KEY,
    currency: process.env.STRIPE_CURRENCY,
    statementDescriptor: process.env.STRIPE_STATEMENT_DESCRIPTOR,
  },

  vimeo: {
    clientId: process.env.VIMEO_CLIENT_ID,
    clientSecret: process.env.VIMEO_CLIENT_SECRET,
  },

  zencoder: {
    apiKey: process.env.ZENCODER_API_KEY,

    s3: {
      bucket: process.env.ZENCODER_S3_BUCKET,
      credentials: process.env.ZENCODER_S3_CREDENTIALS,
    },
  },

  pdf: {
    templates: {},
  },

  email: {
    templatesPath: path.join(__dirname, 'email'),
  },
};
