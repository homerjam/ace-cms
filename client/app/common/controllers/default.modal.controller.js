class DefaultModalController {
  /* @ngInject */
  constructor ($mdDialog) {
    const vm = this;

    vm.cancel = () => $mdDialog.cancel();
    vm.ok = item => $mdDialog.hide(item);
  }
}

export default DefaultModalController;
