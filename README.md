# ACE CMS

A flexible, API focused, multi-site CMS. ACE takes it's name from the key parts of the stack - Angular, Couch DB and Express.

### Environment variables

	ENVIRONMENT=development|testing|production

    BASE_PATH=/

	FORCE_HTTPS=false
	FORCE_WWW=false

	SESSION_SECRET=

	# The database used during authorisation to map users to agents (in production)
	AUTH_DB_NAME=

    # Used to sign JWTs
	AUTH_TOKEN_SECRET=

    # Super user email(s) (comma separated)
	AUTH_SUPER_USER_ID=

	# Database(s) available to super user (comma separated)
	SLUGS=

	ASSIST_URL=
	ASSIST_USERNAME=
	ASSIST_PASSWORD=

    AUTH0_DOMAIN=
    AUTH0_CLIENT_ID=
    AUTH0_CLIENT_SECRET=

	EMBEDLY_API_KEY=

	# Google APIs credentials (https://console.developers.google.com)
    # note: this should be the contents of the JSON key file with
    # the new lines removed, wrapped in single quotes
	GOOGLE_APIS_JSON_KEY=

	LOGENTRIES_TOKEN=

	# AWS credentials
	AWS_ACCESS_KEY_ID=amazon_web_services_key
	AWS_ACCESS_KEY_SECRET=amazon_web_services_secret

	# Transcoding settings (not used - video conversion now handled by to Zencoder)
	AWS_TCODE_PIPELINE_ID=
	AWS_TCODE_BUCKET_IN=
	AWS_TCODE_BUCKET_OUT=
	AWS_TCODE_REGION=

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

    # Redis credentials (used to store sessions)
	REDIS_HOST=
	REDIS_PORT=
	REDIS_PASSWORD=

    # Database URL (including username/password)
	DB_URL=


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


### Usage

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
