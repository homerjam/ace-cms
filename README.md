# ACE CMS

Flexible, multi-site, headless CMS. ACE takes it's name from the key parts of the stack - Angular, CouchDB and Express.

## Setup

#### Database

ACE uses CouchDB, you can host your own instance or just use [Cloudant](https://cloudant.com). If you choose to host your own then you'll need to build couch with cloudant/clouseau and cloudant/dreyfus. For local development you can use this handy dockerised version [homerjam/couchdb-cloudant-search](https://hub.docker.com/r/homerjam/couchdb-cloudant-search/).

Once you've setup up CouchDB/Cloudant add the URL with credentials to the config:

    DB_URL=https://username:password@username.cloudant.com

ACE is multi-site so you'll need to create an authorisation database to map users to their accounts upon sign in, we'll refer to this as the `auth` database. Create one and push the `auth` design docs from `studiothomas/ace-api` to it. Then add the `auth` db name to the config:

    AUTH_DB_NAME=auth

#### Session

ACE uses redis to persist session data. [Redis Labs](https://redislabs.com/pricing) have a free tier you can use for testing/development.

    REDIS_HOST=endpoint.com
    REDIS_PORT=11484
    REDIS_PASSWORD=password

Provide a secret for session hashing:

    SESSION_SECRET=secret

#### Authorisation

ACE uses [Auth0](https://auth0.com/) to handle authorisation, setup a new client and update the config with required details. You'll need to add a callback URL in the client settings, this should take the format `https://DOMAIN[BASE_PATH]/login`.

    AUTH0_DOMAIN=domain.auth0.com
    AUTH0_CLIENT_ID=
    AUTH0_CLIENT_SECRET=

#### Assistant

ACE uses a separate app to store images, you'll need to deploy this following the instructions at `studiothomas/ace-assist` then update the config:

	ASSIST_URL=
	ASSIST_USERNAME=
	ASSIST_PASSWORD=

## Environment variables

	ENVIRONMENT=development|testing|production

    BASE_PATH=/

	FORCE_HTTPS=false
	FORCE_WWW=false

    # Database URL (including username/password)
	DB_URL=

    # Redis credentials (used to store sessions)
	REDIS_HOST=
	REDIS_PORT=
	REDIS_PASSWORD=

	SESSION_SECRET=
	SESSION_TTL=

	# The database used during authorisation to map users to slugs (in production)
	AUTH_DB_NAME=

    # Used to sign JWTs
	AUTH_TOKEN_SECRET=

    # Super user email(s) (comma separated)
	AUTH_SUPER_USER_ID=

	# Database(s) available to super user (comma separated)
	SLUGS=

    AUTH0_DOMAIN=
    AUTH0_CLIENT_ID=
    AUTH0_CLIENT_SECRET=

	ASSIST_URL=
	ASSIST_USERNAME=
	ASSIST_PASSWORD=

	EMBEDLY_API_KEY=

	# Google APIs credentials (https://console.developers.google.com)
    # note: this should be the contents of the JSON key file with
    # the new lines removed, wrapped in single quotes
	GOOGLE_APIS_JSON_KEY=

	LOGENTRIES_TOKEN=

	# AWS credentials
	AWS_ACCESS_KEY_ID=amazon_web_services_key
	AWS_ACCESS_KEY_SECRET=amazon_web_services_secret

    # S3 bucket for non-image uploads
    AWS_S3_BUCKET=

    # Zencoder
    ZENCODER_S3_BUCKET=
    ZENCODER_S3_CREDENTIALS=

	# Stripe credentials
	STRIPE_API_KEY=         # Secret key
    STRIPE_CLIENT_ID=       # Client API key
    STRIPE_CLIENT_SECRET=   # Secret key (again)

	# Instagram credentials
    INSTAGRAM_CLIENT_ID=
    INSTAGRAM_CLIENT_SECRET=

	# Vimeo credentials
    VIMEO_CLIENT_ID=
    VIMEO_CLIENT_SECRET=


	# Development only
	PORT=port 				# http server port to proxy
	DEV_PORT=dev_port 		# browsersync port
	DEV_EMAIL=dev_email		# development user
	DEV_SLUG=dev_slug		# development db
	DEV_ROLE=admin			# development user's role
	#DEV_SUPER=true			# if present development user will be super

	DEV_STORE_NAME=store_name
	DEV_SENDER_NAME=sender_name
	DEV_SENDER_ADDRESS=sender_email
	DEV_STRIPE_ACCOUNT_ID=stripe_account_id


## Usage

	# start server
	$ npm start

	# start dev
	$ gulp

    # backup db
    $ cloudant-backup --db dbname --folder .backup

    # restore db locally
    $ couch-restore .backup/dbname.json dbname --force

    # sync local db
    $ cloudant-backup --db dbname --folder .backup; couch-restore .backup/dbname.json dbname --force; rm -rf .backup
