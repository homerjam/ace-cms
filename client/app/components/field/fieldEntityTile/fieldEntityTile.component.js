import template from './fieldEntityTile.jade';
import controller from './fieldEntityTile.controller';
import './fieldEntityTile.scss';

const fieldEntityTileComponent = function fieldEntityTileComponent() {
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

export default fieldEntityTileComponent;
