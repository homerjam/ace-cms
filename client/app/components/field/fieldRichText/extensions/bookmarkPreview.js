/* global window */

import MediumEditor from 'medium-editor';

const BookmarkPreview = MediumEditor.Extension.extend({
  name: 'anchor-preview',

  options: {
    /* hideDelay: [number]
    * time in milliseconds to show the anchor tag preview after the mouse has left the anchor tag.
    */
    hideDelay: 500,

    /* previewValueSelector: [string]
    * the default selector to locate where to put the activeAnchor value in the preview
    */
    previewValueSelector: '.medium-editor-toolbar-anchor-preview-inner',

    /* showWhenToolbarIsVisible: [boolean]
    * determines whether the anchor tag preview shows up when the toolbar is visible
    */
    showWhenToolbarIsVisible: false,

    /* showOnEmptyLinks: [boolean]
    * determines whether the anchor tag preview shows up on links with href="" or href="#something"
    */
    showOnEmptyLinks: false,

    /* showPreviewCallback: [function]
    * callback triggered when preview is shown, use to asynchronously manipulate preview value etc
    */
    showPreviewCallback(anchorEl, anchorPreview) {},

    /* getTemplate: [function]
    * function that returns the preview template
    */
    getPreviewTemplate() {
      return `
        <div class="medium-editor-toolbar-anchor-preview" id="medium-editor-toolbar-anchor-preview">
          <div class="medium-editor-toolbar-anchor-preview-inner"></div>
        </div>
      `;
    },
  },

  init() {
    this.anchorPreview = this.createPreview();

    this.getEditorOption('elementsContainer').appendChild(this.anchorPreview);

    this.attachToEditables();
  },

  getInteractionElements() {
    return this.getPreviewElement();
  },

  // TODO: Remove this function in 6.0.0
  getPreviewElement() {
    return this.anchorPreview;
  },

  createPreview() {
    const el = this.document.createElement('div');

    el.id = `medium-editor-anchor-preview-${this.getEditorId()}`;
    el.className = 'medium-editor-anchor-preview';
    el.innerHTML = this.options.getPreviewTemplate();

    this.on(el, 'click', this.handleClick.bind(this));

    return el;
  },

  destroy() {
    if (this.anchorPreview) {
      if (this.anchorPreview.parentNode) {
        this.anchorPreview.parentNode.removeChild(this.anchorPreview);
      }
      delete this.anchorPreview;
    }
  },

  hidePreview() {
    this.anchorPreview.classList.remove('medium-editor-anchor-preview-active');
    this.activeAnchor = null;
  },

  showPreview(anchorEl) {
    if (this.anchorPreview.classList.contains('medium-editor-anchor-preview-active') ||
      anchorEl.getAttribute('data-disable-preview')) {
      return true;
    }

    if (this.options.previewValueSelector) {
      const previewValue = this.anchorPreview.querySelector(this.options.previewValueSelector);

      previewValue.innerHTML = '';

      const a = this.document.createElement('a');
      a.textContent = anchorEl.attributes.href.value;
      a.href = anchorEl.attributes.href.value;

      previewValue.appendChild(a);
    }

    this.options.showPreviewCallback(anchorEl, this.anchorPreview);

    this.anchorPreview.classList.add('medium-toolbar-arrow-over');
    this.anchorPreview.classList.remove('medium-toolbar-arrow-under');

    if (!this.anchorPreview.classList.contains('medium-editor-anchor-preview-active')) {
      this.anchorPreview.classList.add('medium-editor-anchor-preview-active');
    }

    this.activeAnchor = anchorEl;

    this.positionPreview();
    this.attachPreviewHandlers();

    return this;
  },

  positionPreview(activeAnchor) {
    activeAnchor = activeAnchor || this.activeAnchor;

    let containerWidth = this.window.innerWidth;

    const buttonHeight = this.anchorPreview.offsetHeight;

    let boundary = activeAnchor.getBoundingClientRect();
    let diffLeft = this.diffLeft;
    let diffTop = this.diffTop;

    const elementsContainer = this.getEditorOption('elementsContainer');
    const elementsContainerAbsolute = ['absolute', 'fixed'].indexOf(window.getComputedStyle(elementsContainer).getPropertyValue('position')) > -1;
    const relativeBoundary = {};

    let elementsContainerBoundary;
    let top;

    const halfOffsetWidth = this.anchorPreview.offsetWidth / 2;

    const toolbarExtension = this.base.getExtensionByName('toolbar');

    if (toolbarExtension) {
      diffLeft = toolbarExtension.diffLeft;
      diffTop = toolbarExtension.diffTop;
    }

    const defaultLeft = diffLeft - halfOffsetWidth;

    // If container element is absolute / fixed, recalculate boundaries to be relative to the container
    if (elementsContainerAbsolute) {
      elementsContainerBoundary = elementsContainer.getBoundingClientRect();
      ['top', 'left'].forEach((key) => {
        relativeBoundary[key] = boundary[key] - elementsContainerBoundary[key];
      });

      relativeBoundary.width = boundary.width;
      relativeBoundary.height = boundary.height;
      boundary = relativeBoundary;

      containerWidth = elementsContainerBoundary.width;

      // Adjust top position according to container scroll position
      top = elementsContainer.scrollTop;
    } else {
      // Adjust top position according to window scroll position
      top = this.window.pageYOffset;
    }

    const middleBoundary = boundary.left + (boundary.width / 2);

    top += (buttonHeight + boundary.top + boundary.height) - diffTop - this.anchorPreview.offsetHeight;

    this.anchorPreview.style.top = `${Math.round(top)}px`;
    this.anchorPreview.style.right = 'initial';
    if (middleBoundary < halfOffsetWidth) {
      this.anchorPreview.style.left = `${defaultLeft + halfOffsetWidth}px`;
      this.anchorPreview.style.right = 'initial';
    } else if ((containerWidth - middleBoundary) < halfOffsetWidth) {
      this.anchorPreview.style.left = 'auto';
      this.anchorPreview.style.right = 0;
    } else {
      this.anchorPreview.style.left = `${defaultLeft + middleBoundary}px`;
      this.anchorPreview.style.right = 'initial';
    }
  },

  attachToEditables() {
    this.subscribe('editableMouseover', this.handleEditableMouseover.bind(this));
    this.subscribe('positionedToolbar', this.handlePositionedToolbar.bind(this));
  },

  handlePositionedToolbar() {
    // If the toolbar is visible and positioned, we don't need to hide the preview
    // when showWhenToolbarIsVisible is true
    if (!this.options.showWhenToolbarIsVisible) {
      this.hidePreview();
    }
  },

  handleClick(event) {
    const anchorExtension = this.base.getExtensionByName('anchor');
    let activeAnchor = this.activeAnchor;

    if (anchorExtension && activeAnchor) {
      event.preventDefault();

      this.base.selectElement(this.activeAnchor);

      // Using setTimeout + delay because:
      // We may actually be displaying the anchor form, which should be controlled by delay
      this.base.delay(() => {
        if (activeAnchor) {
          const opts = {
            value: activeAnchor.attributes.href.value,
            target: activeAnchor.getAttribute('target'),
            buttonClass: activeAnchor.getAttribute('class'),
          };
          anchorExtension.showForm(opts);
          activeAnchor = null;
        }
      });
    }

    this.hidePreview();
  },

  handleAnchorMouseout() {
    this.anchorToPreview = null;
    if (this.activeAnchor) {
      this.off(this.activeAnchor, 'mouseout', this.instanceHandleAnchorMouseout);
    }
    this.instanceHandleAnchorMouseout = null;
  },

  handleEditableMouseover(event) {
    const target = MediumEditor.util.getClosestTag(event.target, 'a');

    if (target === false) {
      return;
    }

    // Detect empty href attributes
    // The browser will make href="" or href="#top"
    // into absolute urls when accessed as event.target.href, so check the html
    if (!this.options.showOnEmptyLinks &&
      (!/href=["']\S+["']/.test(target.outerHTML) || /href=["']#\S+["']/.test(target.outerHTML))) {
      return;
    }

    // only show when toolbar is not present
    const toolbar = this.base.getExtensionByName('toolbar');
    if (!this.options.showWhenToolbarIsVisible && toolbar && toolbar.isDisplayed && toolbar.isDisplayed()) {
      return;
    }

    // detach handler for other anchor in case we hovered multiple anchors quickly
    if (this.activeAnchor && this.activeAnchor !== target) {
      this.detachPreviewHandlers();
    }

    this.anchorToPreview = target;

    this.instanceHandleAnchorMouseout = this.handleAnchorMouseout.bind(this);
    this.on(this.anchorToPreview, 'mouseout', this.instanceHandleAnchorMouseout);
    // Using setTimeout + delay because:
    // - We're going to show the anchor preview according to the configured delay
    //   if the mouse has not left the anchor tag in that time
    this.base.delay(() => {
      if (this.anchorToPreview) {
        this.showPreview(this.anchorToPreview);
      }
    });
  },

  handlePreviewMouseover() {
    this.lastOver = (new Date()).getTime();
    this.hovering = true;
  },

  handlePreviewMouseout(event) {
    if (!event.relatedTarget || !/anchor-preview/.test(event.relatedTarget.className)) {
      this.hovering = false;
    }
  },

  updatePreview() {
    if (this.hovering) {
      return;
    }
    const durr = (new Date()).getTime() - this.lastOver;
    if (durr > this.options.hideDelay) {
      // hide the preview 1/2 second after mouse leaves the link
      this.detachPreviewHandlers();
    }
  },

  detachPreviewHandlers() {
    // cleanup
    clearInterval(this.intervalTimer);
    if (this.instanceHandlePreviewMouseover) {
      this.off(this.anchorPreview, 'mouseover', this.instanceHandlePreviewMouseover);
      this.off(this.anchorPreview, 'mouseout', this.instanceHandlePreviewMouseout);
      if (this.activeAnchor) {
        this.off(this.activeAnchor, 'mouseover', this.instanceHandlePreviewMouseover);
        this.off(this.activeAnchor, 'mouseout', this.instanceHandlePreviewMouseout);
      }
    }

    this.hidePreview();

    this.hovering = this.instanceHandlePreviewMouseover = this.instanceHandlePreviewMouseout = null;
  },

  // TODO: break up method and extract out handlers
  attachPreviewHandlers() {
    this.lastOver = (new Date()).getTime();
    this.hovering = true;

    this.instanceHandlePreviewMouseover = this.handlePreviewMouseover.bind(this);
    this.instanceHandlePreviewMouseout = this.handlePreviewMouseout.bind(this);

    this.intervalTimer = setInterval(this.updatePreview.bind(this), 200);

    this.on(this.anchorPreview, 'mouseover', this.instanceHandlePreviewMouseover);
    this.on(this.anchorPreview, 'mouseout', this.instanceHandlePreviewMouseout);
    this.on(this.activeAnchor, 'mouseover', this.instanceHandlePreviewMouseover);
    this.on(this.activeAnchor, 'mouseout', this.instanceHandlePreviewMouseout);
  },
});

class MediumEditorExtension extends BookmarkPreview {
  constructor (options) {
    super();
    Object.assign(this.options, options);
  }
}

export default MediumEditorExtension;
