class UsersController {
  /* @ngInject */
  constructor(ConfigFactory) {
    const vm = this;

    vm.users = ConfigFactory.getConfig().users;
  }
}

export default UsersController;
