import template from './fieldAudio.jade';
import controller from './fieldAudio.controller';
import './fieldAudio.scss';

const fieldAudioComponent = function fieldAudioComponent() {
  'ngInject';

  return {
    restrict: 'E',
    scope: {
      fieldOptions: '=',
      fieldModel: '=',
      fieldApply: '=?',
    },
    template,
    controller,
    controllerAs: 'vm',
    bindToController: true,
  };
};

export default fieldAudioComponent;
