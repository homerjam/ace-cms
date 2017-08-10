import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import usersComponent from './users.component';

const usersModule = angular.module('users', [
  uiRouter,
])

  .config(($stateProvider) => {
    'ngInject';

    $stateProvider.state('users', {
      url: '/users',
      views: {
        content: {
          template: '<users></users>',
        },
      },
      data: {
        permissions: 'users',
      },
    });
  })

  .filter('roleName', (ConfigFactory) => {
    'ngInject';

    return (input) => {
      const role = ConfigFactory.getRole(input);
      if (!role) {
        return '';
      }
      return role.name;
    };
  })

  .directive('users', usersComponent);

export default usersModule;
