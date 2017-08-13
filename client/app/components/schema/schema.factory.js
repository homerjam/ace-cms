import _ from 'lodash';
import schemaModalTemplate from './schema.modal.jade';
import fieldModalTemplate from '../field/field.modal.jade';

const SchemaFactory = function SchemaFactory ($rootScope, $http, $filter, $mdDialog, ConfigFactory, FieldFactory, HelperFactory, appConfig) {
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
    settings: {},
  };

  const service = {};

  const slugPattern = (existing, slug) => (({
    test: function (existing, slug, value) {
      const validRegExp = /^[^\d][a-zA-Z0-9]*$/;
      const existsRegExp = new RegExp(`^(${existing.join('|')})$`);
      return validRegExp.test(value) && (!existsRegExp.test(value) || value === slug);
    }.bind(null, existing, slug),
  }));

  const slugify = (item) => {
    item.slug = _.camelCase(item.name);
  };

  const editField = async (field, schema, event) => {
    const createNew = !field;

    if (!field) {
      field = defaultField;
    }

    const fieldDialog = {
      controller: 'DefaultModalController',
      bindToController: true,
      controllerAs: 'vm',
      template: fieldModalTemplate,
      targetEvent: event,
      clickOutsideToClose: true,
      multiple: true,
      locals: {
        field: _.merge({}, field),
        createNew,
        slugPattern: slugPattern(schema.fields.map(field => field.slug), field.slug),
        slugify,
      },
    };

    try {
      field = await $mdDialog.show(fieldDialog);
    } catch (error) {
      return false;
    }

    if (createNew) {
      schema.fields.push(field);
    } else {
      HelperFactory.replace(schema.fields, field, 'slug');
    }

    $rootScope.$apply();

    return field;
  };

  const editFieldSettings = async (field, schema, event) => {
    const settings = await FieldFactory.field(field.type).editSettings(field, event);

    if (settings) {
      field.settings = settings;
    }
  };

  service.editSchema = async (schema, event) => {
    const createNew = !schema;

    if (!schema) {
      schema = defaultSchema;
    }

    let config = ConfigFactory.getConfig();

    const schemaDialog = {
      controller: 'DefaultModalController',
      bindToController: true,
      controllerAs: 'vm',
      template: schemaModalTemplate,
      targetEvent: event,
      clickOutsideToClose: true,
      locals: {
        schema: _.merge({}, schema),
        createNew,
        slugPattern: slugPattern(config.schemas.map(schema => schema.slug), schema.slug),
        slugify,
        editField,
        editFieldSettings,
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
