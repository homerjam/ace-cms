import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import <%= name %>Component from './<%= name %>.component';

const <%= name %>Module = angular.module('<%= name %>', [
  uiRouter,
])

  .config(($stateProvider) => {
    'ngInject';

    $stateProvider.state('<%= name %>', {
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
