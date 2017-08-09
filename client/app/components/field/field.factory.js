import angular from 'angular';

import Field from './field.class';

const FieldFactory = ($rootScope) => {
  'ngInject';

  const fields = {};

  const factory = {

    registerField(type, options) {
      fields[type] = new Field(options);
    },

    field(type) {
      return fields[type];
    },

    fields() {
      return fields;
    },

  };

  $rootScope.$field = factory;

  return factory;
};

export default FieldFactory;
