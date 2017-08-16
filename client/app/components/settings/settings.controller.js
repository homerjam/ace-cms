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
        .then((config) => {
          vm.config = config;
          ConfigFactory.setConfig(config);
        });
    };
  }
}

export default SettingsController;
