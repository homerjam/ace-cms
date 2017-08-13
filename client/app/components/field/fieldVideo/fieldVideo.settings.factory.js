import _ from 'lodash';
import settingsModalTemplate from './fieldVideo.settings.jade';
import outputModalTemplate from './fieldVideo.settings.output.jade';

const FieldVideoSettingsFactory = function FieldVideoSettingsFactory($rootScope, $mdDialog, HelperFactory) {
  'ngInject';

  const service = {};

  const defaultOutput = {

  };

  const formatOptions = [
    {
      value: 'mp4',
      name: 'mp4',
    },
    {
      value: 'webm',
      name: 'webm',
    },
  ];

  const qualityOptions = [
    {
      value: 1,
      name: 'Mediocre',
    },
    {
      value: 2,
      name: 'Acceptable',
    },
    {
      value: 3,
      name: 'Good',
    },
    {
      value: 4,
      name: 'Great',
    },
    {
      value: 5,
      name: 'Lossless',
    },
  ];

  const slugify = (item) => {
    item.slug = _.camelCase(item.name);
  };

  const editOutput = async (output, outputs, event) => {
    const createNew = !output;

    if (!output) {
      output = defaultOutput;
    }

    const outputDialog = {
      controller: 'DefaultModalController',
      bindToController: true,
      controllerAs: 'vm',
      template: outputModalTemplate,
      targetEvent: event,
      clickOutsideToClose: true,
      multiple: true,
      locals: {
        output: _.merge({}, output),
        createNew,
        slugify,
        formatOptions,
        qualityOptions,
      },
    };

    try {
      output = await $mdDialog.show(outputDialog);
    } catch (error) {
      return false;
    }

    if (createNew) {
      outputs.push(output);
    } else {
      HelperFactory.replace(outputs, output, 'slug');
    }

    $rootScope.$apply();

    return output;
  };

  const deleteOutput = async (output, outputs, event) => {
    const confirmDialog = $mdDialog.confirm({
      title: 'Delete Output?',
      textContent: `Are you sure you want to delete ${output.name}?`,
      targetEvent: event,
      ok: 'Confirm',
      cancel: 'Cancel',
      multiple: true,
    });

    try {
      await $mdDialog.show(confirmDialog);
    } catch (error) {
      return false;
    }

    _.remove(outputs, { slug: output.slug });

    $rootScope.$apply();

    return true;
  };

  service.edit = async (field, event) => {
    const settingsDialog = {
      controller: 'DefaultModalController',
      bindToController: true,
      controllerAs: 'vm',
      template: settingsModalTemplate,
      targetEvent: event,
      clickOutsideToClose: true,
      multiple: true,
      locals: {
        settings: _.merge({}, field.settings),
        editOutput,
        deleteOutput,
      },
    };

    let settings;

    try {
      settings = await $mdDialog.show(settingsDialog);
    } catch (error) {
      return false;
    }

    return settings;
  };

  return service;
};

export default FieldVideoSettingsFactory;
