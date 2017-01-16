import _ from 'lodash';
import controller from './field.controller';
import './field.scss';

const fieldComponent = function fieldComponent($compile) {
  'ngInject';

  const link = ($scope, $element) => {
    const fieldType = _.kebabCase($scope.vm.fieldType);

    $element.html(`<field-${fieldType}
      field-model="vm.fieldModel"
      field-options="vm.fieldOptions"
      field-apply="vm.fieldApply"
      field-disabled="vm.fieldDisabled"
      ></field-${fieldType}>`);

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
