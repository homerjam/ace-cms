// import _ from 'lodash';

const SettingsFactory = ($http, ConfigFactory, appConfig) => {
  'ngInject';

  const service = {};

  service.save = async (settings) => {
    const config = (await $http.post(`${appConfig.apiUrl}/settings`, { settings })).data;

    ConfigFactory.setConfig(config);
  };

  return service;
};

export default SettingsFactory;
