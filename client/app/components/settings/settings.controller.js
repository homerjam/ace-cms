class SettingsController {
  /* @ngInject */
  constructor($http, ConfigFactory, SettingsFactory) {
    const vm = this;

    vm.config = ConfigFactory.getConfig();

    vm.user = ConfigFactory.getUser();

    vm.gaViews = [];

    const gaGetViews = async () => {
      const config = await ConfigFactory.refreshProvider('google');
      vm.gaViews = (await $http.get(`https://www.googleapis.com/analytics/v3/management/accounts/~all/webproperties/~all/profiles?access_token=${config.provider.google.access_token}`)).data.items;
      return vm.gaViews;
    };

    vm.save = () => {
      SettingsFactory.save(vm.config.client);
    };

    vm.authProvider = async (provider, userSettings = false) => {
      vm.config = await ConfigFactory.authProvider(provider, userSettings ? vm.user.id : undefined);

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
