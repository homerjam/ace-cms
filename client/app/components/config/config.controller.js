class ConfigController {
  /* @ngInject */
  constructor(ConfigFactory) {
    const vm = this;

    vm.config = ConfigFactory.getConfig();

    vm.save = () => {
      ConfigFactory.saveConfig(vm.config);
    };
  }
}

export default ConfigController;
