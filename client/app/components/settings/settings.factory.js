import angular from 'angular';

const SettingsFactory = ($rootScope, $window, $http, $q, $log, $auth, SatellizerConfig, appConfig) => {
  'ngInject';

  const service = {};

  let settings;

  $rootScope.$settings = service;

  service.settings = (updatedSettings) => {
    if (updatedSettings) {
      settings = updatedSettings;
    }

    return settings;
  };

  service.loadSettings = () => $q((resolve, reject) => {
    $http({
      method: 'GET',
      url: `${appConfig.apiUrl}/settings`,
    })
      .then((response) => {
        resolve(service.settings(response.data));
      }, reject);
  });

  service.saveSettings = obj => $q((resolve, reject) => {
    $http({
      method: 'PUT',
      url: `${appConfig.apiUrl}/settings`,
      data: {
        settings: obj,
      },
    })
      .then((response) => {
        resolve(service.settings(response.data));
      }, reject);
  });

  service.authenticateWithProvider = provider => $q((resolve, reject) => {
    $http({
      method: 'GET',
      url: `${appConfig.apiUrl}/auth/${provider}/config`,
      cache: true,
    })
      .then((response) => {
        SatellizerConfig.providers[provider].clientId = response.data.clientId;
        SatellizerConfig.providers[provider].redirectUri = `${$window.location.origin}${appConfig.apiUrl}/auth/${provider}`;
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

export default SettingsFactory;

