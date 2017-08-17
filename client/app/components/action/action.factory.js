import Action from './action.class';

const ActionFactory = ($rootScope) => {
  'ngInject';

  const actions = {};

  const factory = {

    registerAction(type, options) {
      actions[type] = new Action(options);
    },

    action(type) {
      return actions[type];
    },

    actions() {
      return actions;
    },

  };

  $rootScope.$action = factory;

  return factory;
};

export default ActionFactory;
