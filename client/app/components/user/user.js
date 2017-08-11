import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import userComponent from './user.component';
import UserFactory from './user.factory';

const usersModule = angular.module('user', [
  uiRouter,
])

  .config(($stateProvider) => {
    'ngInject';

    $stateProvider.state('user', {
      url: '/users',
      views: {
        content: {
          template: '<user></user>',
        },
      },
      data: {
        permissions: 'user',
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

  .factory('UserFactory', UserFactory)

  .directive('user', userComponent);

export default usersModule;
