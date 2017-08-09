import angular from 'angular';

const proprietaryFilters = angular.module('proprietaryFilters', []);

proprietaryFilters.filter('crossCheck', () => (input) => {
  let result = false;

  if (input === true || input === 'true' || input === 1 || input === '1') {
    result = true;
  }

  return result ? 'mdi mdi-lg mdi-check' : 'mdi mdi-lg mdi-close';
});

proprietaryFilters.filter('status', () => (input) => {
  let result = false;

  if (input === true || input === 'true' || input === 1 || input === '1') {
    result = true;
  }

  return result ? 'Trashed' : 'Active';
});

proprietaryFilters.filter('datePublished', ($filter) => {
  'ngInject';

  return (input, entity) => {
    if (!entity.published) {
      return '-';
    }
    return $filter('date')(Date.parse(input), 'short');
  };
});

export default proprietaryFilters;
