import _ from 'lodash';

import ConfigModalController from '../controllers/config.modal.controller';
import * as configModalTemplates from '../templates/modal';

const ConfigFactory = ($rootScope, $http, $q, $window, ModalService, appConfig, $auth, SatellizerConfig) => {
  'ngInject';

  const service = {};

  let Config;
  let User;

  // const observerCallbacks = [];

  // const notifyObservers = () => {
  //   observerCallbacks.forEach((callback) => {
  //     callback();
  //   });
  // };

  // service.registerObserverCallback = (callback) => {
  //   observerCallbacks.push(callback);
  // };

  const update = (response) => {
    Config = response.data;
    $rootScope.$config = Config;

    const userId = response.headers('x-user-id');
    Config.users.forEach((user, i) => {
      if (user.id === userId) {
        User = Config.users[i];
      }
    });
    $rootScope.$user = User;

    const role = response.headers('x-role');
    $rootScope.$isSuperUser = role === 'super';

    return Config;
  };

  service.load = async () => {
    const response = await $http.get(`${appConfig.apiUrl}/config`);
    return update(response);
  };

  service.save = async (config) => {
    const response = await $http.post(`${appConfig.apiUrl}/config`, { config });
    return update(response);
  };

  service.getConfig = () => _.cloneDeep(Config);

  service.setConfig = (config) => {
    Config = config;
  };

  service.getUser = (userId = null) => {
    if (userId) {
      return Config.users.filter(user => user.id === userId)[0];
    }
    return _.cloneDeep(User);
  };

  service.getSchema = schemaSlug => Config.schemas.filter(schema => schema.slug === schemaSlug)[0];

  service.getField = (schemaSlug, fieldSlug) => (service.getSchema(schemaSlug).fields || []).filter(field => field.slug === fieldSlug)[0];

  service.getAction = (schemaSlug, actionSlug) => (service.getSchema(schemaSlug).actions || []).filter(action => action.slug === actionSlug)[0];

  service.getTaxonomy = taxonomySlug => Config.taxonomies.filter(taxonomy => taxonomy.slug === taxonomySlug)[0];

  service.getRole = roleSlug => Config.roles.filter(role => role.slug === roleSlug)[0];

  service.authenticateWithProvider = provider => $q((resolve, reject) => {
    $http({
      method: 'GET',
      url: `${appConfig.apiUrl}/auth/${provider}/config`,
      cache: true,
    })
      .then((response) => {
        SatellizerConfig.providers[provider].clientId = response.data.clientId;
        SatellizerConfig.providers[provider].redirectUri = `${$window.location.origin}${appConfig.apiUrl}/auth/${provider}`;
        SatellizerConfig.providers[provider].url = `${appConfig.apiUrl}/auth/${provider}`;
        SatellizerConfig.providers[provider].popupOptions = {};

        $auth.authenticate(provider, {
          clientSecret: response.data.clientSecret,
        })
          .then((response) => {
            resolve(response.data);
          }, reject);
      }, reject);
  });

  // service.loadCurrentUser = () => $q((resolve, reject) => {
  //   $http({
  //     method: 'GET',
  //     url: `${appConfig.apiUrl}/config/user/current`,
  //   })
  //     .then((response) => {
  //       User = response.data;
  //       User.superUser = User.role === 'super';
  //       resolve(User);
  //     }, reject);
  // });

  // service.getCurrentUser = () => User;

  // service.loadRoles = () => $q((resolve, reject) => {
  //   $http({
  //     method: 'GET',
  //     url: `${appConfig.apiUrl}/config/roles`,
  //   })
  //     .then((response) => {
  //       Roles = response.data;
  //       resolve(Roles);
  //     }, reject);
  // });

  // service.getRoles = () => _.values(Roles);

  // service.getRolesByKey = () => Roles;

  // service.load = type => $q((resolve, reject) => {
  //   service.search(type)
  //     .then(resolve, reject);
  // });

  // const prepItems = (type, returnArray) => {
  //   if (type === 'field') {
  //     const schemasByField = {};

  //     Items[type].forEach((item) => {
  //       schemasByField[item.slug] = [];
  //     });

  //     service.get('schema', true).forEach((schema) => {
  //       schema.fields.forEach((field) => {
  //         schemasByField[field.slug].push(schema);
  //       });
  //     });

  //     returnArray = returnArray.map((item) => {
  //       item._schemas = schemasByField[item.slug];
  //       return item;
  //     });
  //   }

  //   if (type === 'action') {
  //     const schemasByAction = {};

  //     Items[type].forEach((item) => {
  //       schemasByAction[item.slug] = [];
  //     });

  //     service.get('schema', true).forEach((schema) => {
  //       if (!schema.actions) {
  //         return;
  //       }

  //       schema.actions.forEach((action) => {
  //         schemasByAction[action.slug].push(schema);
  //       });
  //     });

  //     returnArray = returnArray.map((item) => {
  //       item._schemas = schemasByAction[item.slug];
  //       return item;
  //     });
  //   }

  //   return returnArray;
  // };

  // service.get = (type, activeOnly = false) => {
  //   let returnArray = Items[type];

  //   if (!returnArray) {
  //     return [];
  //   }

  //   returnArray = prepItems(type, returnArray);

  //   if (activeOnly) {
  //     returnArray = returnArray.filter(item => item.trashed !== true);
  //   }

  //   return returnArray;
  // };

  // service.getByKey = (type, activeOnly = false) => {
  //   const returnMap = {};

  //   service.get(type, activeOnly).forEach((item) => {
  //     returnMap[item.slug] = item;
  //   });

  //   return returnMap;
  // };

  // service.search = (type, options = {}) => $q((resolve, reject) => {
  //   const params = {
  //     q: options.q || '*:*',
  //     sort: options.sort || '<score>',
  //     limit: options.limit || 200,
  //     include_docs: true,
  //   };

  //   $http({
  //     method: 'GET',
  //     url: `${appConfig.apiUrl}/config/${type}/list`,
  //     params,
  //   })
  //     .then((response) => {
  //       Items[type] = response.data.rows.map(row => row.doc);

  //       resolve(service.get(type, true));
  //     }, (error) => {
  //       if (error.status === 404) {
  //         $log.error(error.data);
  //         resolve();
  //         return;
  //       }
  //       reject(error);
  //     })
  //     .finally(notifyObservers);
  // });

  // service.create = (type, item) => $q((resolve, reject) => {
  //   $http({
  //     method: 'POST',
  //     url: `${appConfig.apiUrl}/config/${type}`,
  //     data: {
  //       item,
  //     },
  //   })
  //     .then((response) => {
  //       item._id = response.data._id;
  //       item._rev = response.data._rev;

  //       Items[type].push(item);

  //       resolve(item);
  //     }, reject)
  //     .finally(notifyObservers);
  // });

  // service.read = (type, params) => $q((resolve, reject) => {
  //   $http({
  //     method: 'GET',
  //     url: `${appConfig.apiUrl}/config/${type}`,
  //     params,
  //   })
  //     .then((response) => {
  //       const items = response.data.rows.map(row => row.value);

  //       resolve(items);
  //     }, reject);
  // });

  // service.update = (type, items, item) => $q((resolve, reject) => {
  //   // Create clean copies of items to save
  //   let updatedItems = items.map((updatedItem) => {
  //     updatedItem = angular.copy(updatedItem);

  //     if (item) {
  //       angular.forEach(item, (value, key) => {
  //         if (key[0] === '_' && !/^(_id|_rev)$/.test(key)) {
  //           delete updatedItem[key];

  //         } else if (!/^(slug)$/.test(key)) {
  //           updatedItem[key] = value;
  //         }
  //       });
  //     }

  //     updatedItem.trashed = false;

  //     return updatedItem;
  //   });

  //   $http({
  //     method: 'PUT',
  //     url: `${appConfig.apiUrl}/config/${type}`,
  //     data: {
  //       items: updatedItems,
  //     },
  //   })
  //     .then((response) => {
  //       if (!response) {
  //         return reject();
  //       }

  //       const items = angular.isArray(response.data) ? response.data : [response.data];

  //       // Update saved item revisions
  //       updatedItems = updatedItems.map((updatedItem) => {
  //         items.forEach((item) => {
  //           if (updatedItem._id === item.id) {
  //             updatedItem._rev = item.rev;
  //           }
  //         });

  //         return updatedItem;
  //       });

  //       // Update stored versions
  //       Items[type] = Items[type].map((item) => {
  //         updatedItems.forEach((updatedItem) => {
  //           if (updatedItem._id === item._id) {
  //             angular.extend(item, updatedItem);
  //           }
  //         });

  //         return item;
  //       });

  //       resolve(prepItems(type, updatedItems));
  //     }, reject)
  //     .finally(notifyObservers);
  // });

  // service.newItem = type => $q((resolve, reject) => {
  //   ModalService.showModal({
  //     template: configModalTemplates[type],
  //     controller: ConfigModalController,
  //     controllerAs: 'vm',
  //     inputs: {
  //       mode: 'new',
  //       configType: type,
  //       items: [],
  //     },
  //   }).then((modal) => {
  //     modal.result.then((obj) => {
  //       service.create(type, obj.item)
  //         .then(resolve, reject);
  //     });
  //   });
  // });

  // service.editItems = (type, items) => $q((resolve, reject) => {
  //   const multi = items.length > 1;

  //   ModalService.showModal({
  //     template: configModalTemplates[type + (multi ? 'Multi' : '')],
  //     controller: ConfigModalController,
  //     controllerAs: 'vm',
  //     inputs: {
  //       mode: 'edit',
  //       configType: type,
  //       items,
  //     },
  //   }).then((modal) => {
  //     modal.result.then((obj) => {
  //       service.update(type, obj.items, obj.item)
  //         .then(resolve, reject);
  //     });
  //   });
  // });

  // service.deleteItems = (type, items) => $q((resolve, reject) => {
  //   $http({
  //     method: 'DELETE',
  //     url: `${appConfig.apiUrl}/config/${type}`,
  //     data: {
  //       items,
  //     },
  //   })
  //     .then(resolve, reject)
  //     .finally(notifyObservers);
  // });

  // service.cloneItem = (type, item) => $q((resolve, reject) => {
  //   item = angular.copy(item);

  //   item = _.omit(item, (value, key) => key[0] === '_' || key[0] === '$');

  //   item.name = `${item.name} Copy`;
  //   item.slug = '';

  //   ModalService.showModal({
  //     template: configModalTemplates[type],
  //     controller: ConfigModalController,
  //     controllerAs: 'vm',
  //     inputs: {
  //       mode: 'clone',
  //       configType: type,
  //       items: [item],
  //     },
  //   }).then((modal) => {
  //     modal.result.then((obj) => {
  //       service.create(type, obj.item).then(resolve, reject);
  //     });
  //   });
  // });

  return service;
};

export default ConfigFactory;
