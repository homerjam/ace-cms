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

    vm.authenticateWithProvider = (provider) => {
      ConfigFactory.authenticateWithProvider(provider)
        .then((config) => {
          if (provider === 'google') {
            const providerConfig = config.provider[provider];

            config.provider[provider].expires = providerConfig.expires_in + Math.floor(+new Date() / 1000);

            $http.get(`https://www.googleapis.com/plus/v1/people/me?access_token=${providerConfig.access_token}`)
              .then(async (result) => {
                config.provider[provider].user = result.data;

                const views = await gaGetViews();

                if (views.length) {
                  config.client.gaView = views[0].id;
                }

                vm.config = config;
                ConfigFactory.saveConfig(config);
              });

            return;
          }

          vm.config = config;
          ConfigFactory.setConfig(config);
        });
    };

    if (vm.config.provider.google) {
      gaGetViews();
    }
  }
}

export default SettingsController;
