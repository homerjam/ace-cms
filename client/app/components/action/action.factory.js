import angular from 'angular';

import Action from './action.class';

const ActionFactory = ($rootScope) => {
  'ngInject';

  const actions = {};

  const factory = {

    registerAction(actionType, options) {
      actions[actionType] = new Action(options);
    },

    action(actionType) {
      return actions[actionType];
    },

    actions() {
      return actions;
    },

  };

  $rootScope.$action = factory;

  return factory;
};

export default ActionFactory;
