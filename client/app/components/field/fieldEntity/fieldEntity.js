import _ from 'lodash';
import angular from 'angular';
import fieldEntityComponent from './fieldEntity.component';
import settingsTemplate from './fieldEntity.settings.jade';

const fieldEntityModule = angular.module('fieldEntity', [])

  .config(() => {
    'ngInject';
  })

  .run((FieldFactory, EntityFactory, AdminFactory) => {
    'ngInject';

    FieldFactory.registerField('entity', {
      name: 'Entity',
      settingsTemplate,
      thumbnailField: true,
      toString(value) {
        if (_.isArray(value)) {
          return value.slice(0, 1).map(entity => entity.title).join(', ');
        }
        if (_.isObject(value)) {
          return value.title || '';
        }
        return value || '';
      },
      toDb(value, settings) {
        if (!value) {
          return value;
        }

        if (!settings.multiple) {
          value = _.isObject(value) ? [value] : value;
        }

        value = value.map((entity) => {
          const _entity = {
            id: entity._id || entity.id,
            type: 'entity',
            schema: entity.schema,
            title: entity.title,
            slug: entity.slug,
            published: entity.published,
            thumbnail: entity.thumbnail,
          };

          if (entity.fields) {
            _entity.thumbnail = EntityFactory.getEntityThumbnail(entity);
          }

          if (settings.groupEnabled) {
            _entity.groupBefore = entity.groupBefore || false;
            _entity.groupAfter = entity.groupAfter || false;
          }

          return _entity;
        });

        return value;
      },
      fromDb(value, settings) {
        value = value || [];

        if (!settings.multiple) {
          return value.length ? value[0] : null;
        }

        return value;
      },
      thumbnail(value) {
        if (!value || !value[0]) {
          return null;
        }

        if (value[0].thumbnail && value[0].thumbnail.thumbnailUrl) {
          return value[0].thumbnail;
        }

        const thumbnailFieldSlug = AdminFactory.getByKey('schema')[value[0].schema].thumbnailField;
        const thumbnailFieldType = AdminFactory.getByKey('field')[thumbnailFieldSlug].fieldType;

        const thumbnail = FieldFactory.field(thumbnailFieldType).thumbnail(value[0].thumbnail);

        return thumbnail;
      },
    });

  })

  .directive('fieldEntity', fieldEntityComponent);

export default fieldEntityModule;
