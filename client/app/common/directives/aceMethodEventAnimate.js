import angular from 'angular';

export default angular.module('ace.mea', []).directive('aceMea', [
  () => ({
    restrict: 'A',

    link($scope, $element, $attr) {

      $element.on($attr.aceMeaEvent || 'click touchend', () => {
        const result = $scope.$eval($attr.aceMea);

        $element.addClass('animated');

        if (result) {
          $element.addClass($attr.aceMeaTrue);
        } else {
          $element.addClass($attr.aceMeaFalse);
        }

        $scope.$apply();
      });

      $element.on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => {
        $element.removeClass('animated');
        $element.removeClass($attr.aceMeaTrue);
        $element.removeClass($attr.aceMeaFalse);
      });

    },
  }),
]);

