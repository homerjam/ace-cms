import angular from 'angular';
import 'medium-editor/dist/css/medium-editor.css';
// import 'medium-editor/dist/css/themes/default.css'
import 'medium-editor/dist/css/themes/flat.css';
import MediumEditor from 'medium-editor';

const repeat = (string, n) => {
  let result = '';
  for (let i = 0; i < n; i++) {
    result += string;
  }
  return result;
};

const forEach = (array, callback, scope) => {
  for (let i = 0; i < array.length; i++) {
    callback.call(scope, i, array[i]);
  }
};

const recursiveListFormat = (listNode, tablevel) => {
  let html = '';

  tablevel++;

  // tab out and add the <ul> or <ol> html piece
  html += repeat('\t', tablevel - 1) + listNode.outerHTML.substring(0, 4);

  forEach(listNode.childNodes, (index, node) => {
    /* istanbul ignore next: browser catch */
    const nodeName = node.nodeName.toLowerCase();

    if (nodeName === '#comment') {
      html += `<!--${node.nodeValue}-->`;
      return;
    }

    if (nodeName === '#text') {
      html += node.textContent;
      return;
    }

    /* istanbul ignore next: not tested, and this was original code -- so not wanting to possibly cause an issue, leaving it... */
    if (!node.outerHTML) {
      // no html to add
      return;
    }

    if (nodeName === 'ul' || nodeName === 'ol') {
      html += `\n${recursiveListFormat(node, tablevel)}`;
    } else {
      // no reformatting within this childNode, so just do the tabing...
      html += `\n${repeat('\t', tablevel)}${node.outerHTML}`;
    }
  });

  // now add on the </ol> or </ul> piece
  html += `\n${repeat('\t', tablevel - 1)}${listNode.outerHTML.substring(listNode.outerHTML.lastIndexOf('<'))}`;

  return html;
};

const prettyHtml = (htmlValue) => {
  htmlValue = htmlValue.replace(/(?:\r\n|\r|\n|\t)/g, '');

  const nodes = angular.element(`<div>${htmlValue}</div>`)[0].childNodes;

  if (nodes.length > 0) {
    htmlValue = '';

    forEach(nodes, (index, node) => {
      const nodeName = node.nodeName.toLowerCase();

      if (nodeName === '#comment') {
        htmlValue += `<!--${node.nodeValue}-->`;
        return;
      }

      if (nodeName === '#text') {
        htmlValue += node.textContent;
        return;
      }

      if (!node.outerHTML) {
        // nothing to format!
        return;
      }

      if (htmlValue.length > 0) {
        // we aready have some content, so drop to a new line
        htmlValue += '\n';
      }

      if (nodeName === 'ul' || nodeName === 'ol') {
        // okay a set of list stuff we want to reformat in a nested way
        htmlValue += `${recursiveListFormat(node, 0)}`;
      } else {
        // just use the original without any additional formating
        htmlValue += `${node.outerHTML}`;
      }
    });
  }

  return htmlValue;
};

export default angular.module('ace.richText', [])

  .filter('prettyHtml', () => input => prettyHtml(input))

  .directive('aceRichText', () => ({
    restrict: 'EA',
    require: ['aceRichText', 'ngModel'],

    scope: {
      options: '=?',
      showHtml: '=?',
    },

    bindToController: true,
    controllerAs: 'vm',

    link(scope, element, attrs, ctrls) {
      ctrls[0].ngModel = ctrls[1];
    },

    controller: function ($scope, $element, $document, $timeout) {
      'ngInject';

      const vm = this;

      let editor;

      function toggleHtml(showHtml) {
        if (!editor) {
          return;
        }

        if (showHtml) {
          angular.forEach(editor.elements, element => angular.element(element).css('display', 'none'));
          angular.forEach(editor.origElements, element => angular.element(element).css('display', 'block'));

          $element.val(prettyHtml(vm.ngModel.$viewValue));
        }
        if (!showHtml) {
          angular.forEach(editor.origElements, element => angular.element(element).css('display', 'none'));
          angular.forEach(editor.elements, element => angular.element(element).css('display', 'block'));

          editor.setContent(prettyHtml($element.val()));
        }
      }

      function init () {
        editor = new MediumEditor($element, vm.options || {});

        vm.ngModel.$render = () => {
          $element.html(vm.ngModel.$viewValue || '');

          editor.setContent(vm.ngModel.$viewValue || '');

          const placeholder = editor.getExtensionByName('placeholder');

          if (placeholder) {
            placeholder.updatePlaceholder($element[0]);
          }
        };

        const toInnerText = (value) => {
          const tempEl = $document[0].createElement('div');
          tempEl.innerHTML = value;
          const text = tempEl.textContent || '';
          return text.trim();
        };

        vm.ngModel.$isEmpty = (value) => {
          if (/[<>]/.test(value)) {
            return toInnerText(value).length === 0;
          } else if (value) {
            return value.length === 0;
          }
          return true;
        };

        editor.subscribe('editableInput', (event, editable) => {
          vm.ngModel.$setViewValue(prettyHtml(editable.innerHTML.trim()));
        });

        toggleHtml(false);

        $scope.$emit('aceRichText:init', editor);
      }

      $scope.$watch(() => vm.showHtml, toggleHtml);

      $scope.$watch(() => vm.ngModel, init);

      vm.$onDestroy = () => {
        if (!editor) {
          return;
        }

        editor.destroy();
      };
    },
  }));
