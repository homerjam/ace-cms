import _ from 'lodash';

class FieldUserController {
  /* @ngInject */
  constructor($q, ConfigFactory) {
    const vm = this;

    if (!vm.fieldModel.value) {
      vm.fieldModel.value = [];
    }

    vm.clear = () => {
      vm.searchText = '';
      vm.fieldModel.value[0] = undefined;
    };

    const users = ConfigFactory.getConfig().users;

    vm.search = async query => users
      .filter(user => !_.find(vm.fieldModel.value, { id: user.id }))
      .filter(user => new RegExp(query, 'i').test(`${user.firstName} ${user.lastName}`))
      .map(user => ({
        id: user.id,
        title: `${user.firstName} ${user.lastName}`,
        slug: _.kebabCase(`${user.firstName} ${user.lastName}`),
        // firstName: user.firstName,
        // lastName: user.lastName,
        // email: user.email,
        type: 'user',
      }));
  }
}

export default FieldUserController;
