import angular from 'angular';

import * as crops from './crops';
import * as videoOutputs from './videoOutputs';
import * as audioOutputs from './audioOutputs';
import * as thumbnails from './thumbnails';

const fieldSettingsTypes = {
  crops,
  videoOutputs,
  audioOutputs,
  thumbnails,
};

const ConfigFieldSettingsFactory = ($q, ModalService) => {
  'ngInject';

  const service = {};

  service.edit = (fieldSettingsType, input) => $q((resolve, reject) => {
    input = input ? angular.copy(input) : {};

    ModalService.showModal({
      template: fieldSettingsTypes[fieldSettingsType].template,
      controller: fieldSettingsTypes[fieldSettingsType].controller,
      controllerAs: 'vm',
      inputs: {
        input,
      },
    }).then((modal) => {
      modal.result.then(resolve, reject);
    });
  });

  return service;
};

export default ConfigFieldSettingsFactory;
