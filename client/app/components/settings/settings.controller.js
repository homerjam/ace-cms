class SettingsController {
  /* @ngInject */
  constructor(ConfigFactory) {
    const vm = this;

    vm.config = ConfigFactory.getConfig();

    vm.save = () => {
      ConfigFactory.save(vm.config);
    };

    vm.authenticateWithProvider = (provider) => {
      ConfigFactory.authenticateWithProvider(provider)
        .then((providerSettings) => {
          vm.config.provider[provider] = providerSettings;
          ConfigFactory.save(vm.config);
        });
    };
  }
}

export default SettingsController;
