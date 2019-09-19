import _ from 'lodash';
import angular from 'angular';
import he from 'he/he';
import Handlebars from 'handlebars/dist/handlebars';
import selectEntityModalTemplate from './modal/selectEntity.jade';
import entityModalTemplate from './modal/entity.jade';

const EntityFactory = ($rootScope, $http, $q, $log, $filter, $timeout, $mdDialog, EntityGridFactory, FieldFactory, ConfigFactory, HelperFactory, appConfig) => {
  'ngInject';

  const service = {};

  $rootScope.$entity = service;

  function prepEntitiesFromDb (entities) {
    return entities.map((entity) => {
      if (entity.published) {
        entity.publishedAt = new Date(Date.parse(entity.publishedAt));
      }

      entity.fields = _.mapValues(entity.fields, (field, fieldSlug) => {
        const fieldOpts = ConfigFactory.getField(entity.schema, fieldSlug);

        if (!fieldOpts) {
          return field;
        }

        field.value = FieldFactory.field(field.type).fromDb(field.value, fieldOpts.settings);

        return field;
      });

      return entity;
    });
  }

  function getEntityById (params) {
    return $q((resolve, reject) => {
      const multipleEntities = angular.isArray(params.id);
      const singularSchema = !angular.isArray(params.id) && ConfigFactory.getSchema(params.id.split('.')[1]);

      const opts = {
        method: multipleEntities ? 'POST' : 'GET',
        url: `${appConfig.apiUrl}/entities`,
      };

      opts[multipleEntities ? 'data' : 'params'] = params;

      $http(opts)
        .then((response) => {
          const results = response.data.map(row => row.doc);

          if (!results.length) {
            if (!singularSchema) {
              return reject(new Error('Entity(s) not found'));
            }
          }

          const entities = prepEntitiesFromDb(results);

          resolve(entities);
        }, reject);
    });
  }

  service.getTitleSlug = (entity) => {
    let title;
    let slug;

    const schema = ConfigFactory.getSchema(entity.schema);

    // Grab templates, fallback to first field
    const titleTemplate = schema.titleTemplate ? schema.titleTemplate : schema.settings.singular ? schema.name : `{{${schema.fields[0].slug}}}`;
    const slugTemplate = schema.slugTemplate ? schema.slugTemplate : schema.settings.singular ? schema.name : `{{${schema.fields[0].slug}}}`;

    // Convert fields to a readable format
    const titleFields = _.mapValues(entity.fields, (field, fieldSlug) => {
      const fieldOptions = schema.fields.filter(field => field.slug === fieldSlug)[0];
      if (!fieldOptions) {
        return null;
      }
      return $filter('field2String')(field, fieldOptions, 10);
    });

    const slugFields = _.mapValues(titleFields, (field, fieldSlug) => (field ? field.replace(/'|"|&|<|>|`/g, '') : field));

    // Compile templates
    title = Handlebars.compile(titleTemplate)(titleFields);
    slug = Handlebars.compile(slugTemplate)(slugFields);

    slug = _.kebabCase(slug);

    // Trim dashes
    title = $filter('trimify')(title);
    slug = $filter('trimify')(slug);

    // Decode entities
    title = he.decode(title);
    slug = he.decode(slug);

    return { title, slug };
  };

  service.getFieldThumbnail = (field) => {
    if (!field || !field.value) {
      return null;
    }

    const thumbnail = FieldFactory.field(field.type).thumbnail(field.value);

    if (thumbnail) {
      thumbnail.ratio = _.isNaN(thumbnail.width / thumbnail.height) ? 0 : thumbnail.width / thumbnail.height;
    }

    return thumbnail;
  };

  const getThumbnailField = (entity) => {
    const thumbnailFields = ConfigFactory.getSchema(entity.schema).thumbnailFields;

    if (!thumbnailFields) {
      return null;
    }

    let thumbnailField = null;

    thumbnailFields.forEach((fieldSlug) => {
      const field = entity.fields && entity.fields[fieldSlug];
      if (!thumbnailField && field && field.value) {
        const value = _.isArray(field.value) ? field.value[0] : field.value;
        if (!value) {
          return;
        }
        thumbnailField = field;
      }
    });

    return thumbnailField;
  };

  service.getEntityThumbnail = entity => service.getFieldThumbnail(getThumbnailField(entity));

  function prepEntityToDb (entity, schemaSlug) {
    entity = angular.copy(entity);

    const now = JSON.stringify(new Date()).replace(/"/g, '');

    const schema = ConfigFactory.getSchema(schemaSlug || entity.schema);

    if (!schema) {
      throw Error('Schema not found');
    }

    if (!entity.createdBy) {
      entity.createdBy = ConfigFactory.getUser().id;
      entity.created = now;
    }

    entity.modifiedBy = ConfigFactory.getUser().id;
    entity.modifiedAt = now;

    if (entity.published) {
      entity.publishedAt = JSON.stringify(entity.publishedAt).replace(/"/g, '');
    }

    entity.schema = schema.slug;

    const { title, slug } = service.getTitleSlug(entity);

    entity.title = title;
    entity.slug = slug;

    entity.fields = _.mapValues(entity.fields, (field, fieldSlug) => {
      const fieldOpts = ConfigFactory.getField(schema.slug, fieldSlug);

      if (!_.find(schema.fields, field => field.slug === fieldSlug)) {
        return null;
      }

      field.type = fieldOpts.type;
      field.fieldType = fieldOpts.type; // TODO: remove fieldType

      field.value = FieldFactory.field(fieldOpts.type).toDb(field.value, fieldOpts.settings);

      return field;
    });

    entity.fields = _.pickBy(entity.fields, field => field);

    entity.thumbnail = service.getEntityThumbnail(entity);

    entity = _.pick(entity, [
      '_id',
      '_rev',
      'type',
      'schema',
      'title',
      'slug',
      'fields',
      'createdAt',
      'createdBy',
      'modifiedAt',
      'modifiedBy',
      'published',
      'publishedAt',
      'thumbnail',
    ]);

    return entity;
  }

  service.fieldValues = async (slug, searchTerm) => (await $http.get(`${appConfig.apiUrl}/entities/field`, { params: { slug, searchTerm } })).data.rows;

  service.search = params => $q((resolve, reject) => {
    $http({
      method: 'GET',
      url: `${appConfig.apiUrl}/entities/search`,
      params: params || {},
    })
      .then((response) => {
        resolve(response.data.rows);
      }, reject);
  });

  service.getRevisions = params => $q((resolve, reject) => {
    $http({
      method: 'GET',
      url: `${appConfig.apiUrl}/entity/revisions`,
      params: params || {},
    })
      .then((response) => {
        resolve(prepEntitiesFromDb(response.data));
      }, reject);
  });

  service.getById = params => $q((resolve, reject) => {
    if (!params.id) {
      reject(new Error('Missing id param'));
    }

    getEntityById(params)
      .then(resolve, reject);
  });

  service.createEntity = (schemaSlug, entity) => $q((resolve, reject) => {
    entity = prepEntityToDb(entity, schemaSlug);

    $http({
      method: 'POST',
      url: `${appConfig.apiUrl}/entity`,
      data: {
        entity,
      },
    })
      .then((response) => {
        resolve(response.data);
      }, reject);
  });

  service.updateEntities = (entities, entity, schema, options) => $q((resolve, reject) => {
    entities = entities.map((_entity) => {
      if (entity && schema) {
        angular.forEach(schema.fields, (field) => {
          if (!field.apply) {
            return;
          }

          if (entity.fields[field.slug]) {
            if (!_entity.fields[field.slug]) {
              _entity.fields[field.slug] = {};
            }
            _entity.fields[field.slug].type = field.type;
            _entity.fields[field.slug].fieldType = field.type; // TODO: remove fieldType
            _entity.fields[field.slug].value = entity.fields[field.slug].value;
          }
        });

        if (options && options.batchPublish) {
          _entity.published = entity.published;
          _entity.publishedAt = entity.publishedAt;
        }
      }

      return prepEntityToDb(_entity);
    });

    $http({
      method: 'PUT',
      url: `${appConfig.apiUrl}/entity`,
      data: {
        entities,
      },
    })
      .then((response) => {
        entities.forEach((entity) => {
          response.data.forEach((doc) => {
            if (entity._id === doc.id) {
              entity._rev = doc.rev;
            }
          });
        });

        $rootScope.$broadcast('EntityFactory:updateEntities', entities);

        resolve(entities);
      }, reject);
  });

  service.deleteEntities = (entities, forever) => $q((resolve, reject) => {
    entities = !angular.isArray(entities) ? [entities] : entities;

    entities = entities.map(entity => entity._id);

    $http({
      method: 'DELETE',
      url: `${appConfig.apiUrl}/entity`,
      data: {
        entities,
        forever,
      },
    })
      .then((response) => {
        resolve(response.data);
      }, reject);
  });

  service.restoreEntities = entities => $q((resolve, reject) => {
    entities = !angular.isArray(entities) ? [entities] : entities;

    entities = entities.map(entity => entity._id);

    $http({
      method: 'PUT',
      url: `${appConfig.apiUrl}/entity`,
      data: {
        restore: true,
        entities,
      },
    })
      .then((response) => {
        resolve(response.data);
      }, reject);
  });

  service.emptyTrash = () => $q((resolve, reject) => {
    $http({
      method: 'DELETE',
      url: `${appConfig.apiUrl}/entity/trashed`,
    })
      .then((response) => {
        resolve(response.data);
      }, reject);
  });

  const deleteFiles = async (fileNames) => {
    try {
      const result = await $http({
        url: `${$rootScope.assistUrl}/${$rootScope.assetSlug}/file/delete`,
        method: 'POST',
        headers: {
          Authorization: `Basic ${$rootScope.assistCredentials}`,
        },
        data: {
          fileNames,
        },
      });
      return result;
    } catch (error) {
      $log.error(error);
      return false;
    }
  };

  service.editEntities = async (entities, siblingEntities = []) => {
    const mode = entities.length > 1 ? 'batchEdit' : entities[0].trashed ? 'trash' : 'normal';
    const id = entities.map(entity => entity.id || entity._id);

    const originalEntity = entities[0];

    try {
      entities = await service.getById({
        id,
        children: 2,
      });

      const entityDialog = {
        controller: 'DefaultModalController',
        bindToController: true,
        controllerAs: 'vm',
        template: entityModalTemplate,
        // targetEvent: event,
        // clickOutsideToClose: true,
        multiple: true,
        locals: {
          mode,
          entities,
          siblingEntities,
        },
      };

      const vm = await $mdDialog.show(entityDialog);

      entities = await service.updateEntities(entities, vm.entity, vm.schema, vm.options);

    } catch (vm) {
      const fileNames = [];
      _.forEach(vm.entity.fields, (field, fieldSlug) => {
        if (/attachment|image|audio|video/.test(field.type) && field.value) {
          if (field.value.file.name !== _.get(originalEntity.fields, [fieldSlug, 'value.file.name'])) {
            fileNames.push(field.value.file.name);
          }
        }
      });
      if (fileNames.length) {
        // TODO: fix delete orphaned files
        // await deleteFiles(fileNames);
      }
      return false;
    }

    return entities;
  };

  service.newEntity = async (schemaSlug) => {
    const entityDialog = {
      controller: 'DefaultModalController',
      bindToController: true,
      controllerAs: 'vm',
      template: entityModalTemplate,
      // targetEvent: event,
      // clickOutsideToClose: true,
      multiple: true,
      locals: {
        mode: 'new',
        entities: [{
          schema: schemaSlug,
        }],
      },
    };

    try {
      const vm = await $mdDialog.show(entityDialog);
      const entity = await service.createEntity(schemaSlug, vm.entity);

      return entity;
    } catch (vm) {
      const fileNames = [];
      _.forEach(vm.entity.fields, (field, fieldSlug) => {
        if (/attachment|image|audio|video/.test(field.type) && field.value) {
          fileNames.push(field.value.file.name);
        }
      });
      if (fileNames.length) {
        // TODO: fix delete orphaned files
        // await deleteFiles(fileNames);
      }
      return false;
    }
  };

  service.selectEntity = async (schemaSlug) => {
    const selectEntityDialog = {
      controller: 'DefaultModalController',
      bindToController: true,
      controllerAs: 'vm',
      template: selectEntityModalTemplate,
      // targetEvent: event,
      // clickOutsideToClose: true,
      multiple: true,
      locals: {
        schemaSlug,
      },
    };

    try {
      const selected = await $mdDialog.show(selectEntityDialog);

      return selected;
    } catch (error) {
      return false;
    }
  };

  return service;
};

export default EntityFactory;
