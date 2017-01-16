import angular from 'angular';

export default angular.module('ace.fileChange', []).directive('aceFileChange', ['$parse', $parse => ({
  restrict: 'A',
  link($scope, element, attrs) {
    const callback = $parse(attrs.aceFileChange);

    const handler = (event) => {
      $scope.$apply(() => {
        callback($scope, { $event: event, files: event.target.files });
      });
    };

    element[0].addEventListener('change', handler, false);
  },
})]);
