import angular from 'angular';
import Menu from './menu/menu';
import Dashboard from './dashboard/dashboard';
import Settings from './settings/settings';
import Config from './config/config';
import Schema from './schema/schema';
import User from './user/user';
import Ecommerce from './ecommerce/ecommerce';
import Taxonomy from './taxonomy/taxonomy';
import Entity from './entity/entity';
import EntityGrid from './entityGrid/entityGrid';
import Field from './field/field';
import Action from './action/action';
import BatchUpload from './batchUpload/batchUpload';
import Tools from './tools/tools';

const componentModule = angular.module('app.components', [
  Menu.name,
  Dashboard.name,
  Settings.name,
  Config.name,
  Schema.name,
  User.name,
  Ecommerce.name,
  Taxonomy.name,
  Entity.name,
  EntityGrid.name,
  Field.name,
  Action.name,
  BatchUpload.name,
  Tools.name,
]);

export default componentModule;
