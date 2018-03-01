class SettingsController {
  /* @ngInject */
  constructor($http, ConfigFactory, SettingsFactory) {
    const vm = this;

    vm.config = ConfigFactory.getConfig();

    vm.gaViews = [];

    const gaGetViews = async () => {
      vm.gaViews = (await $http.get(`https://www.googleapis.com/analytics/v3/management/accounts/~all/webproperties/~all/profiles?access_token=${vm.config.provider.google.access_token}`)).data.items;
      return vm.gaViews;
    };

    vm.save = () => {
      SettingsFactory.save(vm.config.client);
    };

    vm.authenticateWithProvider = async (provider) => {
      const config = await ConfigFactory.authenticateWithProvider(provider);

      vm.config = config;

      if (provider === 'google') {
        const views = await gaGetViews();

        if (views.length) {
          vm.config.client.gaView = views[0].id;
        }
      }

      ConfigFactory.setConfig(vm.config);
    };

    if (vm.config.provider.google) {
      gaGetViews();
    }
  }
}

export default SettingsController;
