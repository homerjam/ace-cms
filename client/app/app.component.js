import template from './app.jade';
import './app.scss';

const appComponent = () => {
  return {
    template,
    restrict: 'E',
  };
};

export default appComponent;

