import _ from 'lodash';

class UserController {
  /* @ngInject */
  constructor(ConfigFactory, UserFactory, HelperFactory) {
    const vm = this;

    vm.users = ConfigFactory.getConfig().users;

    vm.selected = [];

    vm.order = 'lastName';

    vm.changeOrder = (order) => {
      const desc = /-/.test(order);
      order = /[a-z]+/i.exec(order)[0];

      vm.users.sort((a, b) => {
        if (a[order] < b[order]) {
          return desc ? 1 : -1;
        }
        if (a[order] > b[order]) {
          return desc ? -1 : 1;
        }
        return 0;
      });
    };

    vm.edit = async (event, selected) => {
      const user = await UserFactory.editUser(selected[0].id, event);

      if (user) {
        vm.users = HelperFactory.replace(vm.users, user, 'id');

        vm.changeOrder(vm.order);
      }
    };

    vm.new = async (event) => {
      const user = await UserFactory.editUser(null, event);

      if (user) {
        vm.users.push(user);

        vm.changeOrder(vm.order);
      }
    };

    vm.delete = async (event, selected) => {
      const userIds = selected.map(user => user.id);

      const deleted = await UserFactory.deleteUsers(userIds, event);

      if (deleted) {
        vm.users = _.remove(vm.users, user => userIds.indexOf(user.id) === -1);
      }
    };
  }
}

export default UserController;
