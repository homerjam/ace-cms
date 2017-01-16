import template from './batchUpload.jade';
import controller from './batchUpload.controller';
import './batchUpload.scss';

const batchUploadComponent = function batchUploadComponent() {
  'ngInject';

  return {
    restrict: 'E',
    scope: {},
    template,
    controller,
    controllerAs: 'vm',
    bindToController: true,
  };
};

export default batchUploadComponent;
