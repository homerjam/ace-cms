import TaxonomyModule from './taxonomy';
import TaxonomyController from './taxonomy.controller';
import TaxonomyComponent from './taxonomy.component';
import TaxonomyTemplate from './taxonomy.html';

describe('Taxonomy', () => {
  let $rootScope;
  let makeController;

  beforeEach(window.module(TaxonomyModule.name));
  beforeEach(inject((_$rootScope_) => {
    $rootScope = _$rootScope_;
    makeController = () => {
      return new TaxonomyController();
    };
  }));

  describe('Module', () => {
    // top-level specs: i.e., routes, injection, naming
  });

  describe('Controller', () => {
    // controller specs
    // it('has a name property [REMOVE]', () => { // erase if removing this.name from the controller
    //   let controller = makeController();
    //   expect(controller).to.have.property('name');
    // });
  });

  describe('Template', () => {
    // template specs
    // tip: use regex to ensure correct bindings are used e.g., {{  }}
    // it('has name in template [REMOVE]', () => {
    //   expect(TaxonomyTemplate).to.match(/{{\s?vm\.name\s?}}/g);
    // });
  });

  describe('Component', () => {
    // component/directive specs
    const component = TaxonomyComponent();

    it('includes the intended template', () => {
      expect(component.template).to.equal(TaxonomyTemplate);
    });

    it('uses `controllerAs` syntax', () => {
      expect(component).to.have.property('controllerAs');
    });

    it('invokes the right controller', () => {
      expect(component.controller).to.equal(TaxonomyController);
    });
  });
});
