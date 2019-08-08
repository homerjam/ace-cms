/* eslint-env browser */

import angular from 'angular';
import angularSanitize from 'angular-sanitize';
// import angularAnimate from 'angular-animate';
// import angularTouch from 'angular-touch';
import angularAria from 'angular-aria';
import angularMessages from 'angular-messages';
import uiRouter from '@uirouter/angularjs';
import moment from 'moment';
import angularMoment from 'angular-moment';
import 'angular-material-data-table/dist/md-data-table.css';
import angularMaterialDataTable from 'angular-material-data-table';
import '@mdi/font/css/materialdesignicons.css';
import 'angular-material/angular-material.css';
import 'material-design-icons/iconfont/material-icons.css';
import angularMaterial from 'angular-material';
import 'angular-ui-grid/ui-grid.min.css';
import angularUiGrid from 'angular-ui-grid';
import 'ui-grid-draggable-rows';
import angularLoadingBar from 'angular-loading-bar';
import 'angular-ui-tree/dist/angular-ui-tree.css';
import angularUiTree from 'angular-ui-tree';
import 'angular-modal-service2/angular-modal-service2';
import 'angular-modal-service2/angular-modal-service2.css';
import angularDynamicLocale from 'angular-dynamic-locale';
import angularIso3166CountryCodes from 'iso-3166-country-codes-angular';
import satellizer from 'satellizer';
import 'angular-gravatar';
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
  angularIso3166CountryCodes,
  satellizer,
  angularUiGrid,
  'ui.grid.selection',
  'ui.grid.infiniteScroll',
  'ui.grid.cellNav',
  'ui.grid.saveState',
  'ui.grid.draggable-rows',
  'ui.gravatar',
  'hj.modal',
  Common.name,
  Components.name,
])

  .constant('appConfig', window.appConfig)

  .directive('app', AppComponent)

  .config(($compileProvider, $stateProvider, $locationProvider, $urlRouterProvider, $urlMatcherFactoryProvider, $httpProvider, $provide, $sceDelegateProvider, $sceProvider, $qProvider, $localeProvider, cfpLoadingBarProvider, tmhDynamicLocaleProvider, $mdDateLocaleProvider, $mdThemingProvider, $mdIconProvider, $authProvider, appConfig) => {
    'ngInject';

    /* Setup */

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
      `${appConfig.apiUrl}/**`,
    ]);

    // Make sure request body is sent for delete
    $httpProvider.defaults.headers.delete = {
      'Content-Type': 'application/json;charset=utf-8',
    };

    /* Transform dates */

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

    /* Date picker */

    $mdDateLocaleProvider.formatDate = date => (date ? moment(date).format('L LT') : '');

    $mdDateLocaleProvider.parseDate = (dateString) => {
      const m = moment(dateString, 'L LT', true);
      return m.isValid() ? m.toDate() : new Date(NaN);
    };

    $mdDateLocaleProvider.isDateComplete = (dateString) => {
      dateString = dateString.trim();
      // Look for two chunks of content (either numbers or text) separated by delimiters.
      const re = /^(([a-zA-Z]{3,}|[0-9]{1,4})([ .,]+|[/-]))([a-zA-Z]{3,}|[0-9]{1,4})/;
      return re.test(dateString);
    };

    /* Theme */

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

    /* Material design icons */

    $mdIconProvider.fontSet('mdi', 'mdi');

    /* Loading bar */

    // cfpLoadingBarProvider.includeBar = false;
    cfpLoadingBarProvider.includeSpinner = false;

    /* Locale */

    tmhDynamicLocaleProvider.localeLocationPattern('js/angular-i18n/angular-locale_{{locale}}.js');
    tmhDynamicLocaleProvider.defaultLocale('en-gb');

    /* Auth */

    // Redirect if not authorised
    $httpProvider.interceptors.push(($q, $window, $injector) => {
      'ngInject';

      return {
        responseError: (response) => {
          if ([401, 403].indexOf(response.status) === -1) {
            return $q.reject(response);
          }

          const $mdDialog = $injector.get('$mdDialog');
          const appConfig = $injector.get('appConfig');

          console.error(response);

          const message = response.data.message
            || (response.data.error && response.data.error.message)
            || response.data.error
            || response.data;

          $mdDialog.show(
            $mdDialog.alert()
              .title('Not Authorised')
              .htmlContent(`
                <p>${message}</p>
                <!--<p>Please <a href="${$window.location.origin + appConfig.clientBasePath + appConfig.slug}/logout" target="_blank">login</a> again.</p>-->
              `)
              .ok('Close')
          );

          return $q.reject(response);
        },
      };
    });

    /* Providers */

    $authProvider.google({
      scope: [
        'profile',
        'email',
        'https://www.googleapis.com/auth/analytics.readonly',
      ],
      optionalUrlParams: ['access_type'],
      accessType: 'offline',
    });

    $authProvider.instagram({
      scope: ['basic', 'public_content'],
    });

    $authProvider.spotify({
      scope: ['user-read-email', 'user-top-read', 'user-read-recently-played'],
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

  .run(($rootScope, $state, $location, $window, $document, $http, $log, $injector, $q, $timeout, $transitions, tmhDynamicLocale, appConfig, ConfigFactory) => {
    'ngInject';

    /* API Token */

    const tokenRefreshDelay = 3600 * 1000;

    const setApiToken = (apiToken) => {
      localStorage.setItem('apiToken', apiToken);
      appConfig.apiToken = apiToken;
      $rootScope.apiToken = apiToken;
      $http.defaults.headers.common['X-Api-Token'] = apiToken;
    };

    setApiToken($location.search().apiToken || localStorage.getItem('apiToken'));

    const renewToken = async (forceRenew = false) => {
      if (!$document[0].hidden || forceRenew) {
        const apiToken = await ($http.get(`${appConfig.apiUrl}/token`, { params: { expiresIn: 7200 } })).data.token;
        setApiToken(apiToken);
      }

      $timeout(renewToken, tokenRefreshDelay);
    };

    /* Constants */

    $rootScope.slug = appConfig.slug;
    $rootScope.clientBasePath = appConfig.clientBasePath;
    $rootScope.assistUrl = appConfig.assistUrl;
    $rootScope.assistCredentials = appConfig.assistCredentials;
    $rootScope.apiUrl = appConfig.apiUrl;

    $rootScope.$state = $state;
    $rootScope.$location = $location;

    /* Locale */

    $rootScope.$on('$localeChangeSuccess', (event) => {
      // $log.log('$localeChangeSuccess', event);
    });

    tmhDynamicLocale.set('en-gb');

    /* Error Handler */

    $state.defaultErrorHandler((error) => {
      $log.error(error.detail);

      if ($state.current().name !== 'dashboard') {
        $state.go('dashboard');
      }
    });

    /* Permissions */

    const hasPermission = (toState, toParams) => {
      if ($rootScope.$isSuperUser) {
        return true;
      }

      let authorised = false;

      if (toState.data && toState.data.permissions) {
        let required = toState.data.permissions;

        if (angular.isString(required)) {
          required = required.split(',');
        }

        if (angular.isFunction(required)) {
          required = required(toParams);
        }

        required.forEach((permission) => {
          if ($rootScope.$permissions[permission]) {
            authorised = true;
          }
        });
      }

      return authorised;
    };

    /* State Change */

    let configLoaded = false;

    $transitions.onStart({ to: '*' }, (trans) => {
      const toState = trans.to();
      const toParams = trans.params('to');

      if (!configLoaded) {
        ConfigFactory.loadConfig()
          .then((config) => {
            if (config.slug !== appConfig.slug) {
              $window.location.href = `${appConfig.clientBasePath + appConfig.slug}/logout`;
              return;
            }

            configLoaded = true;

            $rootScope.assetSlug = config.assets && config.assets.slug ? config.assets.slug : appConfig.slug;

            $timeout(renewToken, tokenRefreshDelay);

            $state.go(toState.name, toParams);
          }, () => {
            // $window.location.href = `${appConfig.clientBasePath + appConfig.slug}/logout`;
          });

        return false;
      }

      if (!hasPermission(toState, toParams)) {
        $state.go('dashboard');
      }

      return true;
    });

    $transitions.onSuccess({ to: '*' }, (trans) => {
      $state.previous = trans.from().name === '' ? null : trans.from();
      $state.previousParams = trans.params('from');
    });

    $rootScope.prevState = () => {
      $state.go($state.previous, $state.previousParams);
    };
  });
