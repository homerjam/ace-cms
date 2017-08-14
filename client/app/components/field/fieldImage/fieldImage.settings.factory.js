import _ from 'lodash';
import settingsModalTemplate from './fieldImage.settings.jade';
import cropModalTemplate from './fieldImage.settings.crop.jade';

const FieldImageSettingsFactory = function FieldImageSettingsFactory($rootScope, $mdDialog, HelperFactory) {
  'ngInject';

  const service = {};

  const defaultSettings = {
    minWidth: 0,
    minHeight: 0,
    maxWidth: 3000,
    maxHeight: 2000,
    dzi: false,
    crop: [],
  };

  const defaultCrop = {
    minWidth: 0,
    minHeight: 0,
    ratio: 1,
    gravity: 'center',
  };

  const gravityOptions = [
    {
      value: 'Center',
      name: 'Center',
    },
    {
      value: 'North',
      name: 'North',
    },
    {
      value: 'East',
      name: 'East',
    },
    {
      value: 'South',
      name: 'South',
    },
    {
      value: 'West',
      name: 'West',
    },
  ];

  const slugify = (item) => {
    item.slug = _.camelCase(item.name);
  };

  const editCrop = async (crop, crops, event) => {
    const createNew = !crop;

    const cropDialog = {
      controller: 'DefaultModalController',
      bindToController: true,
      controllerAs: 'vm',
      template: cropModalTemplate,
      targetEvent: event,
      clickOutsideToClose: true,
      multiple: true,
      locals: {
        crop: _.merge({}, defaultCrop, crop),
        createNew,
        gravityOptions,
        slugify,
      },
    };

    try {
      crop = await $mdDialog.show(cropDialog);
    } catch (error) {
      return false;
    }

    if (createNew) {
      crops.push(crop);
    } else {
      HelperFactory.replace(crops, crop, 'slug');
    }

    $rootScope.$apply();

    return crop;
  };

  const deleteCrop = async (crop, crops, event) => {
    const confirmDialog = $mdDialog.confirm({
      title: 'Delete Crop?',
      textContent: `Are you sure you want to delete ${crop.name}?`,
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

    _.remove(crops, { slug: crop.slug });

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
        settings: _.merge({}, defaultSettings, field.settings),
        editCrop,
        deleteCrop,
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

export default FieldImageSettingsFactory;
