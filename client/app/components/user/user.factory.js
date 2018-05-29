import _ from 'lodash';
import userModalTemplate from './user.modal.jade';

const UserFactory = function UserFactory ($http, $mdDialog, $mdToast, ConfigFactory, HelperFactory, appConfig) {
  'ngInject';

  const service = {};

  service.inviteUser = async (user, event) => {
    const currentUser = ConfigFactory.getUser();

    try {
      await $http.post(`${appConfig.apiUrl}/email/send`, {
        slug: appConfig.slug,
        templateSlug: '_internal/user-invite',
        subject: 'Signup Invitation',
        toName: user.firstName,
        toEmail: user.email,
        fromName: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
        fromEmail: currentUser.email,
      });

      $mdToast.show(
        $mdToast.simple()
          .textContent('Invitation sent')
          .position('bottom right')
          .hideDelay(2000)
      );
    } catch (error) {
      $mdDialog.show($mdDialog.alert({
        title: 'Error!',
        textContent: error,
        targetEvent: event,
        ok: 'Ok',
      }));
    }
  };

  service.editUser = async (userId, event) => {
    const createNew = !userId;

    let user = userId ? ConfigFactory.getUser(userId) : {};

    let config = ConfigFactory.getConfig();

    const userDialog = {
      controller: 'DefaultModalController',
      bindToController: true,
      controllerAs: 'vm',
      template: userModalTemplate,
      targetEvent: event,
      clickOutsideToClose: true,
      locals: {
        user: _.merge({}, ConfigFactory.defaultUser(), user),
        inviteUser: service.inviteUser,
      },
    };

    try {
      user = await $mdDialog.show(userDialog);
    } catch (error) {
      return false;
    }

    if (createNew) {
      user.id = user.email; // TODO: replace with uuid?

      service.inviteUser(user);

      config = (await $http.post(`${appConfig.apiUrl}/user`, { user })).data;

    } else {
      config = (await $http.put(`${appConfig.apiUrl}/user`, { user })).data;
    }

    ConfigFactory.setConfig(config);

    return user;
  };

  service.deleteUsers = async (userIds, event) => {
    const confirmDialog = $mdDialog.confirm({
      title: 'Delete User?',
      textContent: 'Are you sure you want to delete the selected users?',
      targetEvent: event,
      ok: 'Confirm',
      cancel: 'Cancel',
    });

    try {
      await $mdDialog.show(confirmDialog);
    } catch (error) {
      return false;
    }

    const config = (await $http.delete(`${appConfig.apiUrl}/user`, { data: { userIds } })).data;

    ConfigFactory.setConfig(config);

    return true;
  };

  return service;
};

export default UserFactory;
