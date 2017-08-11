class SettingsController {
  /* @ngInject */
  constructor(ConfigFactory) {
    const vm = this;

    vm.config = ConfigFactory.getConfig();

    vm.save = () => {
      ConfigFactory.saveConfig(vm.config);
    };

    vm.authenticateWithProvider = (provider) => {
      ConfigFactory.authenticateWithProvider(provider)
        .then((providerSettings) => {
          vm.config.provider[provider] = providerSettings;
          ConfigFactory.saveConfig(vm.config);
        });
    };
  }
}

export default SettingsController;
