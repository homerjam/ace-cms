import angular from 'angular';
import fieldRichTextComponent from './fieldRichText.component';
import FieldRichTextSettingsFactory from './fieldRichText.settings.factory';

const fieldRichTextModule = angular.module('fieldRichText', [])

  .config(() => {
    'ngInject';
  })

  .run(($filter, FieldFactory, FieldRichTextSettingsFactory) => {
    'ngInject';

    FieldFactory.registerField('richText', {
      name: 'Rich Text',
      editSettings: FieldRichTextSettingsFactory.edit,
      toString(value) {
        if (!value) {
          return '';
        }
        return $filter('cleanHTML')(value.html);
      },
      toDb(value, settings) {
        if (!value) {
          value = {
            html: '',
            entities: [],
          };
        }

        const pattern = 'href=["\']urn:entity:(\\S+)["\']';
        let re = new RegExp(pattern, 'gim');
        const matchStrings = value.html.match(re);

        if (matchStrings) {
          value.entities = matchStrings.map((matchString) => {
            re = new RegExp(pattern, 'gim');

            const match = re.exec(matchString);

            return {
              id: match[1],
            };
          });
        }

        return value;
      },
    });

  })

  .factory('FieldRichTextSettingsFactory', FieldRichTextSettingsFactory)

  .directive('fieldRichText', fieldRichTextComponent);

export default fieldRichTextModule;
