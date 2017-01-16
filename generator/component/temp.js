import angular from 'angular';
import uiRouter from 'angular-ui-router';
import <%= name %>Component from './<%= name %>.component';

let <%= name %>Module = angular.module('<%= name %>', [
  uiRouter,
])

  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('index.<%= name %>', {
        url: '/<%= name %>',
        views: {
          content: {
            template: '<<%= kebabCaseName %>></<%= kebabCaseName %>>',
          },
        },
      });
  })

  .directive('<%= name %>', <%= name %>Component);

export default <%= name %>Module;
