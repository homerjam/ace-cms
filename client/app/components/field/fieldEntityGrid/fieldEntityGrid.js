import _ from 'lodash';
import angular from 'angular';
import fieldEntityGridComponent from './fieldEntityGrid.component';
import settingsTemplate from './fieldEntityGrid.settings.jade';

const fieldEntityGridModule = angular.module('fieldEntityGrid', [])

  .config(() => {
    'ngInject';
  })

  .run((FieldFactory, EntityFactory) => {
    'ngInject';

    FieldFactory.registerField('entityGrid', {
      name: 'Entity Grid',
      settingsTemplate,
      thumbnailField: true,
      gridOptions: {
        style: 'thumbnail',
      },
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
        return value || [];
      },
      thumbnail(value) {
        return FieldFactory.field('entity').thumbnail(value);
      },
    });

  })

  .directive('fieldEntityGrid', fieldEntityGridComponent);

export default fieldEntityGridModule;
