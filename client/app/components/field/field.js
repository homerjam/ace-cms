import angular from 'angular';
import he from 'he/he';

import fieldComponent from './field.component';
import FieldFactory from './field.factory';

import fieldAttachment from './fieldAttachment/fieldAttachment';
import fieldAudio from './fieldAudio/fieldAudio';
import fieldCheckbox from './fieldCheckbox/fieldCheckbox';
import fieldColor from './fieldColor/fieldColor';
import fieldDate from './fieldDate/fieldDate';
import fieldEmbedly from './fieldEmbedly/fieldEmbedly';
import fieldEntity from './fieldEntity/fieldEntity';
import fieldEntityGrid from './fieldEntityGrid/fieldEntityGrid';
import fieldEntityTile from './fieldEntityTile/fieldEntityTile';
import fieldImage from './fieldImage/fieldImage';
import fieldKeyValue from './fieldKeyValue/fieldKeyValue';
import fieldNumber from './fieldNumber/fieldNumber';
import fieldRichText from './fieldRichText/fieldRichText';
import fieldSelect from './fieldSelect/fieldSelect';
import fieldTaxonomy from './fieldTaxonomy/fieldTaxonomy';
import fieldText from './fieldText/fieldText';
import fieldVideo from './fieldVideo/fieldVideo';
import fieldVimeo from './fieldVimeo/fieldVimeo';

const fieldModule = angular.module('field', [
  fieldAttachment.name,
  fieldAudio.name,
  fieldCheckbox.name,
  fieldColor.name,
  fieldDate.name,
  fieldEmbedly.name,
  fieldEntity.name,
  fieldEntityGrid.name,
  fieldEntityTile.name,
  fieldImage.name,
  fieldKeyValue.name,
  fieldNumber.name,
  fieldRichText.name,
  fieldSelect.name,
  fieldTaxonomy.name,
  fieldText.name,
  fieldVideo.name,
  fieldVimeo.name,
])

  .config(() => {
    'ngInject';
  })

  .filter('field2String', ($window, $filter, FieldFactory) => {
    'ngInject';

    return (field, wordLimit = Infinity) => {
      let output = '';

      if (field === null || field === undefined || field.value === null || field.value === undefined) {
        return output;
      }

      output = FieldFactory.field(field.fieldType).toString(field.value);

      if (typeof output !== 'string') {
        throw Error(`Cannot convert ${field.fieldType} field to string`);
      }

      output = $filter('simplifyText')(output);

      output = $filter('truncateWords')(output, wordLimit);

      output = he.decode(output);

      return output;
    };
  })

  .factory('FieldFactory', FieldFactory)

  .directive('field', fieldComponent);

export default fieldModule;
