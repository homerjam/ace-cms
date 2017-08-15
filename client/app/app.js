/* eslint-env browser */

import angular from 'angular';
import angularSanitize from 'angular-sanitize';
import angularAnimate from 'angular-animate';
import angularTouch from 'angular-touch';
import angularAria from 'angular-aria';
import angularMessages from 'angular-messages';
import uiRouter from '@uirouter/angularjs';
import moment from 'moment';
import angularMoment from 'angular-moment';
import 'angular-material-data-table/dist/md-data-table.css';
import angularMaterialDataTable from 'angular-material-data-table';
import 'mdi/css/materialdesignicons.css';
import 'angular-material/angular-material.css';
import 'material-design-icons/iconfont/material-icons.css';
import angularMaterial from 'angular-material';
import 'angular-ui-grid/ui-grid.min.css';
import angularUiGrid from 'angular-ui-grid';
import angularLoadingBar from 'angular-loading-bar';
import 'angular-ui-tree/dist/angular-ui-tree.css';
import angularUiTree from 'angular-ui-tree';
import angularUiGridDraggableRows from 'ui-grid-draggable-rows';
import 'angular-modal-service2/angular-modal-service2.css';
import angularModalService2 from 'angular-modal-service2';
import angularDynamicLocale from 'angular-dynamic-locale';
import angularIso3166CountryCodes from 'iso-3166-country-codes-angular';
import satellizer from 'satellizer';
import angularSlugify from 'angular-slugify';
import angularGravatar from 'angular-gravatar';
import Common from './common/common';
import Components from './components/components';
import AppComponent from './app.component';

angular.module('app', [
  uiRouter,
  angularSanitize,
  // angularAnimate,
  // angularTouch,
  angularAria,
  angularMessages,
  angularMaterial,
  angularMaterialDataTable,
  angularMoment,
  angularLoadingBar,
  angularUiTree,
  angularDynamicLocale,
  angularModalService2,
  angularIso3166CountryCodes,
  angularSlugify.name,
  satellizer,
  angularUiGrid,
  'ui.grid.selection',
  'ui.grid.infiniteScroll',
  'ui.grid.cellNav',
  'ui.grid.saveState',
  'ui.grid.draggable-rows',
  'ui.gravatar',
  Common.name,
  Components.name,
])

  .constant('appConfig', window.appConfig)

  .directive('app', AppComponent)

  .config(($compileProvider, $stateProvider, $locationProvider, $urlRouterProvider, $urlMatcherFactoryProvider, $httpProvider, $provide, $sceDelegateProvider, $sceProvider, $qProvider, $localeProvider, cfpLoadingBarProvider, tmhDynamicLocaleProvider, $mdDateLocaleProvider, $mdThemingProvider, $mdIconProvider, $authProvider, appConfig) => {
    'ngInject';

    // Compilation
    $compileProvider.preAssignBindingsEnabled(true); // https://github.com/angular/angular.js/commit/bcd0d4d896d0dfdd988ff4f849c1d40366125858
    $compileProvider.debugInfoEnabled(false);

    // Disable unhandled rejection errors
    $qProvider.errorOnUnhandledRejections(false);

    // Routing
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('/404');
    $urlMatcherFactoryProvider.strictMode(false);

    // Whitelist urls
    $sceDelegateProvider.resourceUrlWhitelist([
      'self',
      'http://localhost:*/**',
      'https://*.s3.amazonaws.com/**',
      `${appConfig.assistUrl}/**`,
    ]);

    // Make sure request body is sent for delete
    $httpProvider.defaults.headers.delete = {
      'Content-Type': 'application/json;charset=utf-8',
    };

    // Convert all date strings in responses to date objects
    const dateMatchPattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
    const convertDates = (obj) => {
      Object.keys(obj).forEach((key) => {
        if (obj[key]) {
          const value = obj[key];
          const typeofValue = typeof value;

          if (typeofValue === 'object') {
            convertDates(value);
          } else if (typeofValue === 'string') {
            if (dateMatchPattern.test(value)) {
              obj[key] = new Date(value);
            }
          }
        }
      });
    };
    $httpProvider.defaults.transformResponse.push((data) => {
      if (typeof data === 'object') {
        convertDates(data);
      }
      return data;
    });

    // Remove illegal properties for couchdb
    // var removeIllegalProps = function (obj) {
    //   for (var key in obj) {
    //     if (!obj.hasOwnProperty(key)) {
    //       continue;
    //     }

    //     if (key[0] === '_' && !/^(_id|_rev)$/.test(key)) {
    //       delete obj[key];
    //       continue;
    //     }

    //     var value = obj[key];
    //     var typeofValue = typeof value;

    //     if (typeofValue === 'object') {
    //       removeIllegalProps(value);
    //     }
    //   }
    // };
    // $httpProvider.defaults.transformRequest.push(function (data) {
    //   if (!data) {
    //     return data;
    //   }

    //   try {
    //     data = angular.fromJson(data);

    //     if (typeof data === 'object') {
    //       removeIllegalProps(data);
    //     }

    //     return angular.toJson(data);

    //   } catch (error) {
    //     throw Error(error);
    //   }
    // });

    // Datepicker defaults
    $mdDateLocaleProvider.formatDate = date => moment(date).locale('en-gb').format('L LT');
    $mdDateLocaleProvider.parseDate = dateString => new Date(dateString);

    // Theme settings
    const greyMap = $mdThemingProvider.extendPalette('grey', {
      50: '#ffffff',
    });
    $mdThemingProvider.definePalette('greyWithWhite', greyMap);
    $mdThemingProvider.theme('default')
      .primaryPalette('blue-grey')
      .accentPalette('teal', {
        default: '500',
      })
      .warnPalette('red')
      .backgroundPalette('greyWithWhite', {
        'hue-1': '50',
      });

    // Material design icons
    $mdIconProvider.fontSet('mdi', 'mdi');

    // Loading bar settings
    // cfpLoadingBarProvider.includeBar = false;
    cfpLoadingBarProvider.includeSpinner = false;

    // Locale settings
    tmhDynamicLocaleProvider.localeLocationPattern(`${appConfig.basePath}angular-i18n/angular-locale_{{locale}}.js`);
    tmhDynamicLocaleProvider.defaultLocale('en-gb');

    // Redirect if unauthorised
    $httpProvider.interceptors.push(($q, $window, $injector) => {
      'ngInject';

      return {
        responseError: (response) => {
          if ([401, 403].indexOf(response.status) === -1) {
            return $q.reject(response);
          }

          const $mdDialog = $injector.get('$mdDialog');
          const appConfig = $injector.get('appConfig');
          const message = response.data.message || response.data.error;

          $mdDialog.show(
            $mdDialog.alert()
              .title('Not Authorised')
              .htmlContent(`
                <p>${message}</p>
                <p>Please <a href="${$window.location.origin + appConfig.basePath}logout" target="_blank">login</a></p>
              `)
              .ok('Close')
          );

          return $q.reject(response);
        },
      };
    });

    // Providers
    $authProvider.instagram({
      scope: ['basic', 'public_content'],
    });

    $authProvider.oauth2({
      name: 'vimeo',
      authorizationEndpoint: 'https://api.vimeo.com/oauth/authorize',
      scope: ['public', 'private', 'video_files'],
      defaultUrlParams: ['response_type', 'client_id', 'redirect_uri'],
      responseType: 'code',
      responseParams: {
        code: 'code',
        clientId: 'clientId',
        redirectUri: 'redirectUri',
      },
    });

    $authProvider.oauth2({
      name: 'stripe',
      authorizationEndpoint: 'https://connect.stripe.com/oauth/authorize',
      scope: ['read_write'],
      defaultUrlParams: ['response_type', 'client_id', 'redirect_uri'],
      responseType: 'code',
      responseParams: {
        code: 'code',
        clientId: 'clientId',
        redirectUri: 'redirectUri',
      },
    });
  })

  .run(($rootScope, $state, $location, $window, $document, $log, $injector, $q, $timeout, $transitions, tmhDynamicLocale, appConfig, ConfigFactory, HelperFactory, $mdSidenav) => {
    'ngInject';

    $rootScope.slug = appConfig.slug;
    $rootScope.basePath = appConfig.basePath;
    $rootScope.assistUrl = appConfig.assistUrl;
    $rootScope.assistCredentials = appConfig.assistCredentials;
    $rootScope.apiUrl = appConfig.apiUrl;

    // $rootScope.$on('$localeChangeSuccess', (event) => {
    //   $log.log('$localeChangeSuccess', event);
    // });

    tmhDynamicLocale.set('en-gb');

    $rootScope.$state = $state;
    $rootScope.$location = $location;

    $state.defaultErrorHandler((error) => {
      $log.error(error.detail);

      if ($state.current().name !== 'dashboard') {
        $state.go('dashboard');
      }
    });

    const isAuthorised = (toState, toParams) => {
      if ($rootScope.$isSuperUser) {
        return true;
      }

      let authorised = true;

      if (toState.data && toState.data.permissions) {
        let required;

        if (angular.isString(toState.data.permissions)) {
          required = toState.data.permissions.split(',');
        } else {
          required = toState.data.permissions(toParams);
        }

        required.forEach((permission) => {
          if (!$rootScope.user.permissions[permission]) {
            authorised = false;
          }
        });
      }

      return authorised;
    };

    const renewToken = (forceRenew = false) => {
      if (!$document[0].hidden || forceRenew) {
        HelperFactory.getApiToken();
      }

      $timeout(renewToken, 3600 * 1000);
    };

    let dependenciesLoaded = false;

    const dependencies = [
      ConfigFactory.loadConfig(),
    ];

    $transitions.onStart({ to: '*' }, (trans) => {
      const toStateName = trans.to().name;
      const toParams = trans.params('to');

      if (!dependenciesLoaded) {
        $q.all(dependencies)
          .then(() => {
            dependenciesLoaded = true;

            renewToken(true);

            $state.go(toStateName, toParams);
          }, () => {
            $window.location.href = `${appConfig.basePath}logout`;
          });

        return false;
      }

      if (!isAuthorised(toStateName, toParams)) {
        $state.go('dashboard');
        return false;
      }

      return true;
    });

    $transitions.onSuccess({ to: '*' }, (trans) => {
      $state.previous = trans.from().name === '' ? null : trans.from();
      $state.previousParams = trans.params('from');

      $mdSidenav('mainMenu').close();
    });

    $rootScope.prevState = () => {
      $state.go($state.previous, $state.previousParams);
    };

    $rootScope.toggleMainMenu = () => {
      $mdSidenav('mainMenu').toggle();
    };
  });
