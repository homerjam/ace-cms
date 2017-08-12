import _ from 'lodash';
import schemaModalTemplate from './schema.modal.jade';
import fieldModalTemplate from '../field/field.modal.jade';

const SchemaFactory = function SchemaFactory ($http, $mdDialog, ConfigFactory, HelperFactory, appConfig) {
  'ngInject';

  const defaultSchema = {
    name: '',
    slug: '',
    fields: [],
    actions: [],
  };

  const defaultField = {
    name: '',
    slug: '',
  };

  const service = {};

  function DialogController ($mdDialog) {
    'ngInject';

    const vm = this;

    vm.cancel = () => $mdDialog.cancel();
    vm.ok = item => $mdDialog.hide(item);
  }

  const existingPattern = (existing, slug) => (({
    test: function (existing, slug, value) {
      const existingRegExp = new RegExp(`^(${existing.join('|')})$`);
      const exists = !existingRegExp.test(value) || value === slug;
      return exists;
    }.bind(null, existing, slug),
  }));

  const editField = async (field, schema, event) => {
    if (!field) {
      field = defaultField;
    }

    const fieldDialog = {
      controller: DialogController,
      bindToController: true,
      controllerAs: 'vm',
      template: fieldModalTemplate,
      targetEvent: event,
      clickOutsideToClose: true,
      locals: {
        field: _.clone(field),
        existingPattern: existingPattern(schema.fields.map(field => field.slug), field.slug),
      },
    };

    try {
      field = await $mdDialog.show(fieldDialog);
    } catch (error) {
      return false;
    }

    console.log(field);

    return field;
  };

  service.editSchema = async (schema, event) => {
    const createNew = !!schema;

    if (!schema) {
      schema = defaultSchema;
    }

    let config = ConfigFactory.getConfig();

    const schemaDialog = {
      controller: DialogController,
      bindToController: true,
      controllerAs: 'vm',
      template: schemaModalTemplate,
      targetEvent: event,
      clickOutsideToClose: true,
      locals: {
        schema: _.clone(schema),
        existingPattern: existingPattern(config.schemas.map(schema => schema.slug), schema.slug),
        editField,
      },
    };

    try {
      schema = await $mdDialog.show(schemaDialog);
    } catch (error) {
      return false;
    }

    if (createNew) {
      config = (await $http.post(`${appConfig.apiUrl}/schema`, { schema })).data;
    } else {
      config = (await $http.put(`${appConfig.apiUrl}/schema`, { schema })).data;
    }

    ConfigFactory.setConfig(config);

    return schema;
  };

  service.deleteSchemas = async (schemaSlugs, event) => {
    const confirmDialog = $mdDialog.confirm({
      title: 'Delete Schema?',
      textContent: 'Are you sure you want to delete the selected schemas?',
      targetEvent: event,
      ok: 'Confirm',
      cancel: 'Cancel',
    });

    try {
      await $mdDialog.show(confirmDialog);
    } catch (error) {
      return false;
    }

    const config = (await $http.delete(`${appConfig.apiUrl}/schema`, { params: { schemaSlugs } })).data;

    ConfigFactory.setConfig(config);

    return true;
  };

  return service;
};

export default SchemaFactory;
