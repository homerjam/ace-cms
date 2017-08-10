import angular from 'angular';
import BookmarkButton from './extensions/bookmarkButton';
import BookmarkPreview from './extensions/bookmarkPreview';

class FieldRichTextController {
  /* @ngInject */
  constructor ($scope, $element, $q, $filter, $timeout, EntityFactory, HelperFactory) {
    const vm = this;

    const insertEntityOptions = {
      name: 'insertEntity',
      buttonTitle: 'Insert Entity',
      buttonHtml: '<i class="mdi mdi-bookmark-outline"></i>',
      bookmarkHtml: selection => $q((resolve, reject) => {
        EntityFactory.selectEntity(vm.fieldOptions.settings.schemas[0])
          .then((entities) => {
            resolve(`<a href="urn:entity:${entities[0]._id}">${selection}</a>`);
          }, reject);
      }),
    };

    const createEntityOptions = {
      name: 'createEntity',
      buttonTitle: 'Create Entity',
      buttonHtml: '<i class="mdi mdi-bookmark-plus-outline"></i>',
      bookmarkHtml: selection => $q((resolve, reject) => {
        EntityFactory.newEntity(vm.fieldOptions.settings.schemas[0])
          .then((entity) => {
            resolve(`<a href="urn:entity:${entity._id}">${selection}</a>`);
          }, reject);
      }),
    };

    const buttons = [
      {
        name: 'bold',
        contentDefault: '<i class="mdi mdi-format-bold"></i>',
      },
      {
        name: 'italic',
        contentDefault: '<i class="mdi mdi-format-italic"></i>',
      },
      {
        name: 'underline',
        contentDefault: '<i class="mdi mdi-format-underline"></i>',
      },
      {
        name: 'anchor',
        contentDefault: '<i class="mdi mdi-link-variant"></i>',
      },
      {
        name: 'h2',
        contentDefault: '<i class="mdi mdi-format-header-1"></i>',
      },
      {
        name: 'h3',
        contentDefault: '<i class="mdi mdi-format-header-2"></i>',
      },
      {
        name: 'h4',
        contentDefault: '<i class="mdi mdi-format-header-3"></i>',
      },
      {
        name: 'h5',
        contentDefault: '<i class="mdi mdi-format-header-4"></i>',
      },
      // {
      //   name: 'h6',
      //   contentDefault: '<i class="mdi mdi-format-header-5"></i>',
      // },
      {
        name: 'superscript',
        contentDefault: '<i class="mdi mdi-format-superscript"></i>',
      },
      {
        name: 'subscript',
        contentDefault: '<i class="mdi mdi-format-subscript"></i>',
      },
      {
        name: 'quote',
        contentDefault: '<i class="mdi mdi-format-quote-open"></i>',
      },
      {
        name: 'unorderedlist',
        contentDefault: '<i class="mdi mdi-format-list-bulleted"></i>',
      },
      {
        name: 'orderedlist',
        contentDefault: '<i class="mdi mdi-format-list-numbers"></i>',
      },
      {
        name: 'removeFormat',
        contentDefault: '<i class="mdi mdi-format-clear"></i>',
      },
    ];

    if (vm.fieldOptions.settings && vm.fieldOptions.settings.schemas && vm.fieldOptions.settings.schemas.length) {
      buttons.push('insertEntity');
      buttons.push('createEntity');
    }

    const bookmarkEntitiesMap = {};

    function appendBookmarkPreviewEntity(bookmarkPreview, entity) {
      if (entity.thumbnail) {
        bookmarkPreview.append(`
          <img src="${HelperFactory.getThumbnailUrl(entity.thumbnail, 'h:200;q:60')}">
        `);
      }
      // bookmarkPreview.append(`
      //   <div class="md-caption">${entity.schema}</div>
      // `);
      bookmarkPreview.append(`
        <div class="md-body-1">${entity.title}</div>
      `);
    }

    vm.options = {
      // disableExtraSpaces: true,
      autoLink: true,
      imageDragging: false,
      anchorPreview: false,
      extensions: {
        imageDragging: {},
        insertEntity: new BookmarkButton(insertEntityOptions),
        createEntity: new BookmarkButton(createEntityOptions),
        bookmarkPreview: new BookmarkPreview({
          showPreviewCallback: (anchorEl, anchorPreview) => {
            const bookmarkPreview = angular.element(anchorPreview.querySelector('.medium-editor-toolbar-anchor-preview-inner'));

            if (!/href=["']urn:entity:(\S+)["']/.test(anchorEl.outerHTML)) {
              return;
            }

            bookmarkPreview.empty();

            const entityId = /href=["']urn:entity:(\S+)["']/.exec(anchorEl.outerHTML)[1];

            if (bookmarkEntitiesMap[entityId]) {
              appendBookmarkPreviewEntity(bookmarkPreview, bookmarkEntitiesMap[entityId]);
              return;
            }

            EntityFactory.getById({
              id: entityId,
            })
              .then((entities) => {
                bookmarkEntitiesMap[entityId] = entities[0];

                appendBookmarkPreviewEntity(bookmarkPreview, bookmarkEntitiesMap[entityId]);
              });
          },
        }),
      },
      toolbar: {
        buttons,
      },
      paste: {
        forcePlainText: true,
        cleanPastedHTML: true,
        cleanAttrs: ['class', 'style'],
        cleanTags: ['meta', 'div', 'span'],
      },
    };

    const mdInputContainer = $element.find('md-input-container');

    $scope.$watch(() => vm.showHtml, () => {
      if (vm.fieldModel.value) {
        vm.fieldModel.value.html = $filter('cleanHTML')(vm.fieldModel.value.html);
      }
    });

    $scope.$on('aceRichText:init', (event, editor) => {
      editor.subscribe('editablePaste', () => {
        $timeout(() => {
          vm.fieldModel.value.html = $filter('cleanHTML')(vm.fieldModel.value.html, true);
        });
      });

      editor.subscribe('focus', () => {
        mdInputContainer.addClass('md-input-focused');
      });

      editor.subscribe('blur', () => {
        mdInputContainer.removeClass('md-input-focused');
      });
    });
  }
}

export default FieldRichTextController;
