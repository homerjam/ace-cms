class SettingsController {
  /* @ngInject */
  constructor(ConfigFactory, SettingsFactory) {
    const vm = this;

    vm.config = ConfigFactory.getConfig();

    vm.save = () => {
      SettingsFactory.save(vm.config.client);
    };

    vm.authenticateWithProvider = (provider) => {
      ConfigFactory.authenticateWithProvider(provider)
        .then((config) => {
          vm.config = config;
          ConfigFactory.setConfig(config);
        });
    };
  }
}

export default SettingsController;
