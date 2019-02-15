# ACE CMS

Flexible, multi-site, headless CMS. ACE takes it's name from the key parts of the stack - Angular, CouchDB and Express.

## Setup

#### API

You need a running version of `homerjam/ace-api` to use the CMS, add the url to the config:

	API_URL=

#### Session

Provide a secret for session hashing:

    SESSION_SECRET=secret

#### Authorisation

[Auth0](https://auth0.com/) is used to handle authorisation, setup a new client and update the config with required details. You'll need to add a callback URL in the client settings, this should take the format `https://DOMAIN[BASE_PATH]/login`.

    AUTH0_DOMAIN=domain.auth0.com
    AUTH0_CLIENT_ID=
    AUTH0_CLIENT_SECRET=

#### Assistant

A separate app is used to store images, you'll need to deploy this following the instructions at `homerjam/ace-assist` then update the config:

	ASSIST_URL=
	ASSIST_USERNAME=
	ASSIST_PASSWORD=

## Environment variables

	ENVIRONMENT=development|testing|production

    BASE_URL=
    BASE_PATH=/

	PAGE_TITLE=ACECMS

	MAINTENANCE=false

	FORCE_HTTPS=false
	FORCE_WWW=false

	SESSION_SECRET=change_me
	SESSION_TTL=7200

    # Used to sign JWTs
	AUTH_TOKEN_SECRET=change_me
	AUTH_TOKEN_EXPIRES_IN=86400

    AUTH0_DOMAIN=
    AUTH0_CLIENT_ID=
    AUTH0_CLIENT_SECRET=
    AUTH0_CALLBACK_URL=

    API_PREFIX=api
    API_URL=/api

	ASSIST_URL=
	ASSIST_USERNAME=
	ASSIST_PASSWORD=

	# Development only
    DEV_USER_ID=            # development user
	DEV_ROLE=super			# development user's role

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
