import _ from 'lodash';
import controller from './field.controller';
import './field.scss';

const fieldComponent = function fieldComponent($compile) {
  'ngInject';

  const link = ($scope, $element) => {
    const type = _.kebabCase($scope.vm.fieldType);

    $element.html(`<field-${type}
      field-model="vm.fieldModel"
      field-options="vm.fieldOptions"
      field-apply="vm.fieldApply"
      field-disabled="vm.fieldDisabled"
      ></field-${type}>`);

    $compile($element.contents())($scope);
  };

  return {
    restrict: 'E',
    scope: {
      fieldType: '=',
      fieldOptions: '=',
      fieldModel: '=',
      fieldApply: '=?',
      fieldDisabled: '=?',
    },
    link,
    controller,
    controllerAs: 'vm',
    bindToController: true,
  };
};

export default fieldComponent;
