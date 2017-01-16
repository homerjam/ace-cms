import angular from 'angular';

class SettingsController {
  /* @ngInject */
  constructor($window, SettingsFactory) {
    const vm = this;

    vm.settings = SettingsFactory.settings();

    vm.saveSettings = () => {
      SettingsFactory.saveSettings(vm.settings);
    };

    vm.authenticateWithProvider = (provider) => {
      SettingsFactory.authenticateWithProvider(provider)
        .then((providerSettings) => {
          vm.settings[provider] = providerSettings;
        });
    };
  }
}

export default SettingsController;
