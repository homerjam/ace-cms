import _ from 'lodash';
import angular from 'angular';
import fieldEntityTileComponent from './fieldEntityTile.component';
import FieldEntityTileSettingsFactory from './fieldEntityTile.settings.factory';

const fieldEntityTileModule = angular.module('fieldEntityTile', [])

  .config(($mdThemingProvider) => {
    'ngInject';

    $mdThemingProvider.theme('selected').backgroundPalette('light-blue').dark();
    // $mdThemingProvider.theme('grouped').primaryPalette('pink').accentPalette('grey').dark();
    $mdThemingProvider.theme('grouped').primaryPalette('teal').dark();
    $mdThemingProvider.theme('ungrouped').primaryPalette('blue-grey').dark();
  })

  .run((FieldFactory, EntityFactory, FieldEntityTileSettingsFactory) => {
    'ngInject';

    FieldFactory.registerField('entityTile', {
      name: 'Entity Tile',
      editSettings: FieldEntityTileSettingsFactory.edit,
      thumbnailField: true,
      gridOptions: {
        style: 'thumbnail',
        minWidth: 132,
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

  .factory('FieldEntityTileSettingsFactory', FieldEntityTileSettingsFactory)

  .directive('fieldEntityTile', fieldEntityTileComponent);

export default fieldEntityTileModule;
