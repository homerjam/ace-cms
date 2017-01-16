import angular from 'angular';

export default angular.module('ace.bindHtml', []).directive('aceBindHtml', ['$compile', $compile => ({
  restrict: 'A',
  link(scope, element, attrs) {
    scope.$watch(() => scope.$eval(attrs.aceBindHtml), (value) => {
      // In case value is a TrustedValueHolderType, sometimes it
      // needs to be explicitly called into a string in order to
      // get the HTML string.
      element.html(value && value.toString());
      // If scope is provided use it, otherwise use parent scope
      let compileScope = scope;
      if (attrs.aceBindHtmlScope) {
        compileScope = scope.$eval(attrs.aceBindHtmlScope);
      }
      $compile(element.contents())(compileScope);
    });
  },
})]);
