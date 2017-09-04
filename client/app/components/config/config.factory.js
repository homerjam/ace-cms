import _ from 'lodash';

const ConfigFactory = ($rootScope, $http, $q, $window, $document, $mdDialog, HelperFactory, ModalService, appConfig, $auth, SatellizerConfig) => {
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
      const userId = headers('x-user-id');
      User = _.find(Config.users, { id: userId });
      if (!User) {
        User = {
          id: userId,
        };
      }
      $rootScope.$user = User;

      const role = headers('x-role');

      $rootScope.$isSuperUser = role === 'super';

      if (role !== 'super') {
        $rootScope.$permissions = _.find(Config.roles, { slug: role }).permissions;
      }
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

  service.authenticateWithProvider = provider => $q((resolve, reject) => {
    $http({
      method: 'GET',
      url: `${appConfig.apiUrl}/auth/${provider}/config`,
      cache: true,
    })
      .then((response) => {
        SatellizerConfig.providers[provider].clientId = response.data.clientId;
        SatellizerConfig.providers[provider].redirectUri = `${$window.location.origin + appConfig.clientBasePath}_auth/${provider}`;
        SatellizerConfig.providers[provider].url = `${appConfig.apiUrl}/auth/${provider}`;
        SatellizerConfig.providers[provider].popupOptions = {};

        $auth.authenticate(provider, {
          clientSecret: response.data.clientSecret,
        })
          .then((response) => {
            resolve(response.data);
          }, reject);
      }, reject);
  });

  return service;
};

export default ConfigFactory;
