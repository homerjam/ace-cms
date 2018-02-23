import _ from 'lodash';
import angular from 'angular';
import * as modalTemplates from '../templates/modal';

const HelperFactory = ($rootScope, $window, $document, $http, $q, $timeout, $mdDialog, FieldFactory, appConfig) => {
  'ngInject';

  const service = {};

  $rootScope.$helper = service;

  service.now = () => JSON.stringify(new Date()).replace(/"/g, '');

  service.testExp = (exp, str) => new RegExp(exp).test(str);

  service.move = function (from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
  };

  service.replace = (array, replacementObject, key) => {
    const index = _.findIndex(array, [key, replacementObject[key]]);
    if (index !== -1) {
      array.splice(index, 1, replacementObject);
    }
    return array;
  };

  service.getThumbnailUrl = (thumbnail, transformSettings = 'h:200;q:60') => {
    if (!thumbnail || !thumbnail.thumbnailUrl) {
      return null;
    }

    return [$rootScope.assistUrl, $rootScope.assetSlug, 'proxy', 'transform', transformSettings, thumbnail.thumbnailUrl.replace(/https?:\/\//, '')].join('/');
  };

  service.getFieldThumbnailUrl = (field, transformSettings = 'h:200;q:60') => {
    if (!field || !field.value) {
      return null;
    }

    const thumbnail = FieldFactory.field(field.type).thumbnail(field.value);

    return service.getThumbnailUrl(thumbnail, transformSettings);
  };

  service.getColumnOptions = (fieldOptions) => {
    if (!fieldOptions) {
      return null;
    }

    const colDef = {
      fieldOptions,
      name: `fields.${fieldOptions.slug}`,
      displayName: fieldOptions.name,
      allowCellFocus: false,
    };

    _.extend(colDef, FieldFactory.field(fieldOptions.type).gridOptions);

    if (colDef.style === 'string') {
      colDef.cellTemplate = `
        <div class="ui-grid-cell-contents">
          <span>{{ grid.getCellValue(row, col) | field2String : col.colDef.fieldOptions }}</span>
        </div>
      `;
    }

    if (colDef.style === 'thumbnail') {
      colDef.enableSorting = false;
      colDef.cellTemplate = `
        <div class="ui-grid-cell-contents ui-grid-cell--image">
          <img ace-src-change ng-if="$root.$helper.getFieldThumbnailUrl(grid.getCellValue(row, col))" ng-src="{{ $root.$helper.getFieldThumbnailUrl(grid.getCellValue(row, col)) }}">
        </div>
      `;
    }

    if (colDef.style === 'boolean') {
      colDef.cellTemplate = `
        <div class="ui-grid-cell-contents">
          <span class="{{grid.getCellValue(row, col).value | crossCheck}}"></span>
        </div>
      `;
    }

    return colDef;
  };

  service.postPayload = (url, data) => {
    let payload = data;

    if (!_.isString(data)) {
      payload = JSON.stringify(payload);
    }

    payload = payload.replace(/'/gi, '’');

    let form = `<form method="POST" action="${url}" target="_blank"><input type="hidden" name="payload" value='${payload}' /></form>`;

    form = angular.element(form);

    angular.element($document[0].body).append(form);

    form[0].submit();

    form.remove();
  };

  service.mediaPreview = (media, index) => {
    const mediaPreviewDialog = {
      controller: 'DefaultModalController',
      bindToController: true,
      controllerAs: 'vm',
      template: modalTemplates.mediaPreview,
      // targetEvent: event,
      // clickOutsideToClose: true,
      multiple: true,
      locals: {
        media,
        index,
      },
    };

    $mdDialog.show(mediaPreviewDialog);
  };

  service.oembed = url => $q((resolve, reject) => {
    $http({
      method: 'GET',
      url: `${appConfig.apiUrl}/embedly/oembed`,
      params: {
        url,
      },
    })
      .then((response) => {
        const result = response.data[0];

        if (result.error_message) {
          $mdDialog.show(
            $mdDialog.alert()
              .title('Error')
              .textContent(result.error_message)
              .ok('Close')
          );
          reject(result);
          return;
        }

        resolve(result);
      }, reject);
  });

  service.getMdChipCollection = scope => scope.$parent.$mdChipsCtrl.items;

  service.getMdChipIndex = function getMdChipIndex (scope) {
    scope.$parent.$mdChipsCtrl.items.indexOf(scope.$parent.$chip);
  };

  return service;
};

export default HelperFactory;
