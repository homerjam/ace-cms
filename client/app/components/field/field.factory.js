import angular from 'angular';

import Field from './field.class';

const FieldFactory = ($rootScope) => {
  'ngInject';

  const fields = {};

  const factory = {

    registerField(fieldType, options) {
      fields[fieldType] = new Field(options);
    },

    field(fieldType) {
      return fields[fieldType];
    },

    fields() {
      return fields;
    },

  };

  $rootScope.$field = factory;

  return factory;
};

export default FieldFactory;
