class DefaultModalController {
  /* @ngInject */
  constructor ($mdDialog) {
    const vm = this;

    vm.cancel = item => $mdDialog.cancel(item);
    vm.ok = item => $mdDialog.hide(item);
  }
}

export default DefaultModalController;
