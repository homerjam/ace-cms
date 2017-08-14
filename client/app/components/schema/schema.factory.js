import _ from 'lodash';
import schemaModalTemplate from './schema.modal.jade';
import fieldModalTemplate from '../field/field.modal.jade';
import actionModalTemplate from '../action/action.modal.jade';

const SchemaFactory = function SchemaFactory ($rootScope, $http, $filter, $mdDialog, ConfigFactory, FieldFactory, ActionFactory, HelperFactory, appConfig) {
  'ngInject';

  const defaultSchema = {
    name: '',
    slug: '',
    fields: [],
    actions: [],
    settings: {},
  };

  const defaultField = {
    name: '',
    slug: '',
    settings: {},
  };

  const defaultAction = {
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

    const fieldDialog = {
      controller: 'DefaultModalController',
      bindToController: true,
      controllerAs: 'vm',
      template: fieldModalTemplate,
      targetEvent: event,
      clickOutsideToClose: true,
      multiple: true,
      locals: {
        field: _.merge({}, defaultField, field),
        createNew,
        slugPattern: slugPattern(schema.fields.map(field => field.slug), field ? field.slug : null),
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

  const deleteField = async (field, schema, event) => {
    const confirmDialog = $mdDialog.confirm({
      title: 'Delete field?',
      textContent: `Are you sure you want to delete ${field.name}?`,
      targetEvent: event,
      ok: 'Confirm',
      cancel: 'Cancel',
      multiple: true,
    });

    try {
      await $mdDialog.show(confirmDialog);
    } catch (error) {
      return false;
    }

    _.remove(schema.fields, { slug: field.slug });

    $rootScope.$apply();

    return true;
  };

  const editAction = async (action, schema, event) => {
    const createNew = !action;

    const actionDialog = {
      controller: 'DefaultModalController',
      bindToController: true,
      controllerAs: 'vm',
      template: actionModalTemplate,
      targetEvent: event,
      clickOutsideToClose: true,
      multiple: true,
      locals: {
        action: _.merge({}, defaultAction, action),
        createNew,
        slugPattern: slugPattern(schema.actions.map(action => action.slug), action ? action.slug : null),
        slugify,
      },
    };

    try {
      action = await $mdDialog.show(actionDialog);
    } catch (error) {
      return false;
    }

    if (createNew) {
      schema.actions.push(action);
    } else {
      HelperFactory.replace(schema.actions, action, 'slug');
    }

    $rootScope.$apply();

    return action;
  };

  const editActionSettings = async (action, schema, event) => {
    const settings = await ActionFactory.action(action.type).editSettings(action, event);

    if (settings) {
      action.settings = settings;
    }
  };

  const deleteAction = async (action, schema, event) => {
    const confirmDialog = $mdDialog.confirm({
      title: 'Delete action?',
      textContent: `Are you sure you want to delete ${action.name}?`,
      targetEvent: event,
      ok: 'Confirm',
      cancel: 'Cancel',
      multiple: true,
    });

    try {
      await $mdDialog.show(confirmDialog);
    } catch (error) {
      return false;
    }

    _.remove(schema.actions, { slug: action.slug });

    $rootScope.$apply();

    return true;
  };

  service.editSchema = async (schema, event) => {
    const createNew = !schema;

    let config = ConfigFactory.getConfig();

    const schemaDialog = {
      controller: 'DefaultModalController',
      bindToController: true,
      controllerAs: 'vm',
      template: schemaModalTemplate,
      targetEvent: event,
      clickOutsideToClose: true,
      multiple: true,
      locals: {
        schema: _.merge({}, defaultSchema, schema),
        createNew,
        slugPattern: slugPattern(config.schemas.map(schema => schema.slug), schema ? schema.slug : null),
        slugify,
        editField,
        editFieldSettings,
        deleteField,
        editAction,
        editActionSettings,
        deleteAction,
      },
    };

    try {
      schema = await $mdDialog.show(schemaDialog);
    } catch (error) {
      return false;
    }

    const thumbnailFields = schema.fields.filter(field => FieldFactory.field(field.type).thumbnailField);

    schema.thumbnailFields = thumbnailFields.map(field => field.slug);

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

    const config = (await $http.delete(`${appConfig.apiUrl}/schema`, { data: { schemaSlugs } })).data;

    ConfigFactory.setConfig(config);

    return true;
  };

  service.updateSchemas = async (schemas) => {
    const config = (await $http.put(`${appConfig.apiUrl}/schemas`, { schemas })).data;

    ConfigFactory.setConfig(config);

    return true;
  };

  return service;
};

export default SchemaFactory;
