// http://gsferreira.com/archive/2014/05/angularjs-smart-float-directive/
import angular from 'angular';

export default angular.module('ace.smartFloat', []).directive('aceSmartFloat', ['$filter', '$timeout',
  ($filter, $timeout) => {
    const FLOAT_REGEXP_1 = /^\$?\d+.(\d{3})*(,\d*)$/; // Numbers like: 1.123,56
    const FLOAT_REGEXP_2 = /^\$?\d+,(\d{3})*(\.\d*)$/; // Numbers like: 1,123.56
    const FLOAT_REGEXP_3 = /^\$?\d+(\.\d*)?$/; // Numbers like: 1123.56
    const FLOAT_REGEXP_4 = /^\$?\d+(,\d*)?$/; // Numbers like: 1123,56
    return {
      require: 'ngModel',
      link(scope, element, attrs, ctrl) {
        let formatTimeout;

        scope.$watch(() => ctrl.$viewValue, (newVal) => {
          $timeout.cancel(formatTimeout);
          formatTimeout = $timeout(() => {
            ctrl.$modelValue = newVal;
          }, 1000);
        });

        ctrl.$parsers.unshift((viewValue) => {
          if (FLOAT_REGEXP_1.test(viewValue)) {
            ctrl.$setValidity('float', true);
            return parseFloat(viewValue.replace('.', '').replace(',', '.'));
          } else if (FLOAT_REGEXP_2.test(viewValue)) {
            ctrl.$setValidity('float', true);
            return parseFloat(viewValue.replace(',', ''));
          } else if (FLOAT_REGEXP_3.test(viewValue)) {
            ctrl.$setValidity('float', true);
            return parseFloat(viewValue);
          } else if (FLOAT_REGEXP_4.test(viewValue)) {
            ctrl.$setValidity('float', true);
            return parseFloat(viewValue.replace(',', '.'));
          }
          ctrl.$setValidity('float', false);
          return undefined;
        });

        ctrl.$formatters.unshift(
          modelValue => $filter('number')(parseFloat(modelValue), 2)
        );
      },
    };
  },
]);
