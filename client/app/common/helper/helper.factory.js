import _ from 'lodash';
import angular from 'angular';
import * as modalTemplates from './modal';

const HelperFactory = ($rootScope, $window, $document, $http, $q, $timeout, $mdDialog, AdminFactory, FieldFactory, ModalService, apiPrefix) => {
  'ngInject';

  const service = {};

  $rootScope.$helper = service;

  service.now = () => JSON.stringify(new Date()).replace(/"/g, '');

  service.testExp = (exp, str) => new RegExp(exp).test(str);

  service.move = function (from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
  };

  service.getThumbnailUrl = (thumbnail, transformSettings = 'h:200;q:60') => {
    if (!thumbnail || !thumbnail.thumbnailUrl) {
      return null;
    }

    return [$rootScope.assistUrl, $rootScope.slug, 'proxy', 'transform', transformSettings, thumbnail.thumbnailUrl.replace(/https?:\/\//, '')].join('/');
  };

  service.getFieldThumbnailUrl = (field, transformSettings = 'h:200;q:60') => {
    if (!field) {
      return null;
    }

    const thumbnail = FieldFactory.field(field.fieldType).thumbnail(field.value);

    return service.getThumbnailUrl(thumbnail, transformSettings);
  };

  service.getColumnOptions = (fieldSlug) => {
    const fieldOpts = AdminFactory.getByKey('field')[fieldSlug];

    if (!fieldOpts) {
      return null;
    }

    const columnOptions = {
      name: `fields.${fieldSlug}`,
      displayName: fieldOpts.name,
      allowCellFocus: false,
    };

    const fieldType = fieldOpts.fieldType;

    _.extend(columnOptions, FieldFactory.field(fieldType).gridOptions);

    if (columnOptions.style === 'thumbnail') {
      columnOptions.enableSorting = false;
      columnOptions.cellTemplate = `
        <div class="ui-grid-cell-contents ui-grid-cell--image">
          <img ng-if="$root.$helper.getFieldThumbnailUrl(grid.getCellValue(row, col))" ng-src="{{ $root.$helper.getFieldThumbnailUrl(grid.getCellValue(row, col)) }}">
        </div>
      `;
    }

    if (columnOptions.style === 'boolean') {
      columnOptions.cellTemplate = `
        <div class="ui-grid-cell-contents">
          <span class="{{grid.getCellValue(row, col).value | crossCheck}}"></span>
        </div>
      `;
    }

    return columnOptions;
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
    ModalService.showModal({
      template: modalTemplates.mediaPreview,
      controllerAs: 'vm',
      inputs: {
        media,
        index,
      },
    });
  };

  service.analytics = params => $q((resolve, reject) => {
    $http({
      method: 'GET',
      url: `${apiPrefix}/analytics`,
      params: params || {},
      cache: true,
    })
      .then((response) => {
        resolve(response.data);
      }, reject);
  });

  service.getApiToken = () => $q((resolve, reject) => {
    $http({
      method: 'GET',
      url: `${apiPrefix}/token`,
      cache: false,
    })
      .then((response) => {
        $rootScope.apiToken = response.data.token;

        $timeout(service.getApiToken, 3600000);

        resolve($rootScope.apiToken);
      }, reject);
  });

  service.oembed = url => $q((resolve, reject) => {
    $http({
      method: 'GET',
      url: `${apiPrefix}/embedly/oembed`,
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

  service.getMdChipIndex = scope => scope.$parent.$mdChipsCtrl.items.indexOf(scope.$parent.$chip);

  return service;
};

export default HelperFactory;
