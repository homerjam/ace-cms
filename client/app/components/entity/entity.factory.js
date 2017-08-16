import _ from 'lodash';
import angular from 'angular';
import he from 'he/he';
import Handlebars from 'handlebars/dist/handlebars';
import selectEntityModalTemplate from './modal/selectEntity.jade';
import entityModalTemplate from './modal/entity.jade';

const EntityFactory = ($rootScope, $http, $q, $log, $filter, $timeout, EntityGridFactory, FieldFactory, ConfigFactory, HelperFactory, ModalService, appConfig) => {
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
          if (!response.data.length) {
            if (!singularSchema) {
              return reject(new Error('Entity(s) not found'));
            }
          }

          const entities = prepEntitiesFromDb(response.data);

          resolve(entities);
        }, reject);
    });
  }

  service.getTitleSlug = (entity) => {
    let title;
    let slug;

    // Convert fields to a readable format
    const fields = _.mapValues(entity.fields, field => $filter('field2String')(field, 10));

    const schema = ConfigFactory.getSchema(entity.schema);

    // Grab title template, fallback to first field
    const titleTemplate = schema.titleTemplate && schema.titleTemplate !== '' ? schema.titleTemplate : schema.settings.singular ? schema.name : `{{${schema.fields[0].slug}}}`;

    // Compile template
    title = Handlebars.compile(titleTemplate)(fields);

    // Trim dashes
    title = $filter('trimify')(title);

    if (schema.slugTemplate && schema.slugTemplate !== '') {
      slug = _.camelCase(Handlebars.compile(schema.slugTemplate)(fields));
      slug = $filter('trimify')(slug);

    } else {
      slug = _.camelCase(title);
    }

    // Decode entities
    title = he.decode(title);
    slug = he.decode(slug);

    return { title, slug };
  };

  service.getFieldThumbnail = (field) => {
    if (!field.value) {
      return null;
    }

    const thumbnail = FieldFactory.field(field.type).thumbnail(field.value);

    if (thumbnail) {
      thumbnail.ratio = isNaN(thumbnail.width / thumbnail.height) ? 0 : thumbnail.width / thumbnail.height;
    }

    return thumbnail;
  };

  service.getEntityThumbnail = (entity) => {
    const thumbnailFieldSlug = ConfigFactory.getSchema(entity.schema).thumbnailFields[0];

    if (thumbnailFieldSlug && entity.fields[thumbnailFieldSlug]) {
      return service.getFieldThumbnail(entity.fields[thumbnailFieldSlug]);
    }

    return null;
  };

  service.getEntityThumbnailUrl = (entity, transformSettings) => {
    const thumbnailFieldSlug = ConfigFactory.getSchema(entity.schema).thumbnailFields[0];

    if (thumbnailFieldSlug && entity.fields[thumbnailFieldSlug]) {
      return HelperFactory.getFieldThumbnailUrl(entity.fields[thumbnailFieldSlug], transformSettings);
    }

    return null;
  };

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

    const titleSlug = service.getTitleSlug(entity);

    entity.title = titleSlug.title;
    entity.slug = titleSlug.slug;

    entity.fields = _.mapValues(entity.fields, (field, fieldSlug) => {
      const fieldOpts = ConfigFactory.getField(schema.slug, fieldSlug);

      if (!_.find(schema.fields, field => field.slug === fieldSlug)) {
        return null;
      }

      field.type = 'entityField';
      field.type = fieldOpts.type;

      field.value = FieldFactory.field(fieldOpts.type).toDb(field.value, fieldOpts.settings);

      return field;
    });

    entity.fields = _.pickBy(entity.fields, field => field);

    entity.thumbnail = service.getEntityThumbnail(entity);

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
        if (EntityGridFactory.states[entity.schema]) {
          delete EntityGridFactory.states[entity.schema];
        }

        resolve(response.data);
      }, reject);
  });

  service.updateEntities = entities => $q((resolve, reject) => {
    const arrayMode = angular.isArray(entities);

    entities = !arrayMode ? [entities] : entities;

    entities = entities.map(entity => prepEntityToDb(entity));

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

        resolve(arrayMode ? entities : entities[0]);
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

  service.editEntity = entity => $q((resolve, reject) => {
    service.getById({
      id: entity._id || entity.id,
      children: 1,
    }).then((entities) => {
      ModalService.showModal({
        template: entityModalTemplate,
        controllerAs: 'vm',
        inputs: {
          mode: 'normal',
          entities,
        },
      }).then((modal) => {
        modal.result.then((entity) => {
          service.updateEntities(entity).then(resolve, reject);
        });
      });
    });
  });

  service.newEntity = schemaSlug => $q((resolve, reject) => {
    ModalService.showModal({
      template: entityModalTemplate,
      controllerAs: 'vm',
      inputs: {
        mode: 'new',
        entities: [{
          schema: schemaSlug,
        }],
      },
    }).then((modal) => {
      modal.result
        .then((entity) => {
          service.createEntity(schemaSlug, entity)
            .then((entity) => {
              resolve(entity);
            }, reject);
        }, reject);
    }, reject);
  });

  service.selectEntity = schemaSlug => $q((resolve, reject) => {
    ModalService.showModal({
      template: selectEntityModalTemplate,
      controllerAs: 'vm',
      inputs: {
        schemaSlug,
      },
    }).then((modal) => {
      modal.result
        .then((selected) => {
          resolve(selected);
        }, reject);
    }, reject);
  });

  return service;
};

export default EntityFactory;
