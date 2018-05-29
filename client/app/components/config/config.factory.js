import _ from 'lodash';

const ConfigFactory = ($rootScope, $http, $q, $window, $document, $mdDialog, HelperFactory, appConfig, $auth, SatellizerConfig) => {
  'ngInject';

  const service = {};

  let Config;
  let User;

  const observerCallbacks = [];

  const notifyObservers = () => {
    observerCallbacks.forEach((callback) => {
      callback();
    });
  };

  service.registerObserverCallback = (callback) => {
    observerCallbacks.push(callback);
  };

  const updateConfig = (config, headers = null) => {
    Config = config;
    $rootScope.$config = Config;

    if (headers) {
      const role = headers('x-role');

      $rootScope.$isSuperUser = role === 'super';

      if (!$rootScope.$isSuperUser) {
        $rootScope.$permissions = _.find(Config.roles, { slug: role }).permissions;
      }

      const userId = headers('x-user-id');

      User = _.find(Config.users, { id: userId });

      if (!User) {
        User = _.merge({}, service.defaultUser(), {
          id: userId,
          email: userId,
          role,
        });
      }

      $rootScope.$user = User;
    }

    notifyObservers();

    return Config;
  };

  service.loadConfig = async () => {
    const response = await $http.get(`${appConfig.apiUrl}/config`);
    return updateConfig(response.data, response.headers);
  };

  service.saveConfig = async (config) => {
    const response = await $http.post(`${appConfig.apiUrl}/config`, { config });
    return updateConfig(response.data, response.headers);
  };

  service.getConfig = () => _.merge({}, Config);

  service.setConfig = (config) => {
    updateConfig(config);
  };

  service.defaultUser = () => ({
    email: '',
    firstName: '',
    lastName: '',
    active: true,
    role: 'admin',
  });

  service.getUser = (userId = null) => {
    if (userId) {
      return Config.users.filter(user => user.id === userId)[0];
    }
    return _.merge({}, User);
  };

  service.getSchema = schemaSlug => Config.schemas.filter(schema => schema.slug === schemaSlug)[0];

  service.getField = (schemaSlug, fieldSlug) => (service.getSchema(schemaSlug) || { fields: [] }).fields.filter(field => field.slug === fieldSlug)[0];

  service.getAction = (schemaSlug, actionSlug) => (service.getSchema(schemaSlug) || { actions: [] }).actions.filter(action => action.slug === actionSlug)[0];

  service.getTaxonomy = taxonomySlug => Config.taxonomies.filter(taxonomy => taxonomy.slug === taxonomySlug)[0];

  service.getRole = roleSlug => Config.roles.filter(role => role.slug === roleSlug)[0];

  service.authProvider = (provider, userId = undefined) => $q((resolve, reject) => {
    $http({
      method: 'GET',
      url: `${appConfig.apiUrl}/auth/${provider}/config`,
      cache: true,
    })
      .then((response) => {
        SatellizerConfig.providers[provider].clientId = response.data.clientId;
        SatellizerConfig.providers[provider].redirectUri = `${$window.location.origin + appConfig.clientBasePath}_auth/${provider}`;
        SatellizerConfig.providers[provider].url = `${appConfig.apiUrl}/auth/${provider}${userId ? `/${userId}` : ''}`;
        SatellizerConfig.providers[provider].popupOptions = {};

        $auth.authenticate(provider, {
          clientSecret: response.data.clientSecret,
        })
          .then((response) => {
            resolve(response.data);
          }, reject);
      }, reject);
  });

  service.refreshProvider = async (provider, userId = undefined) => {
    let config = service.getConfig();

    if (Math.floor(new Date().getTime() / 1000) - (config.provider[provider].begins || 0) > config.provider[provider].expires_in) {
      config = (await $http.put(`${appConfig.apiUrl}/auth/${provider}${userId ? `/${userId}` : ''}/refresh`)).data;
      service.setConfig(config);
    }

    return config;
  };

  return service;
};

export default ConfigFactory;
