/* eslint-env browser */

import MediumEditor from 'medium-editor';

const BookmarkButton = MediumEditor.Extension.extend({
  name: 'bookmark',

  init() {
    if (this.options.name) {
      this.name = this.options.name;
    }

    this.button = this.document.createElement('button');
    this.button.classList.add('medium-editor-action');
    this.button.innerHTML = this.options.buttonHtml;
    this.button.title = this.options.buttonTitle;
    this.button.setAttribute('aria-label', this.options.buttonTitle);

    this.on(this.button, 'click', this.handleClick.bind(this));
  },

  getButton() {
    return this.button;
  },

  handleClick(event) {
    const selection = MediumEditor.selection.getSelectionHtml(document);
    const caret = window.getSelection();
    const range = caret.getRangeAt(0);

    this.base.trigger('blur', {}, this.base.elements[0]);

    this.options.bookmarkHtml(selection)
      .then((html) => {
        this.insertHtml(html, caret, range);
        this.base.checkContentChanged();
      });
  },

  insertHtml(html, caret, range) {
    range.deleteContents();

    // Range.createContextualFragment() would be useful here but is
    // only relatively recently standardized and is not supported in
    // some browsers (IE9, for one)
    const tempElement = document.createElement('div');
    tempElement.innerHTML = html;
    const fragment = document.createDocumentFragment();
    let node;
    let lastNode;
    while ((node = tempElement.firstChild)) {
      lastNode = fragment.appendChild(node);
    }
    range.insertNode(fragment);

    // Preserve the caret
    if (lastNode) {
      range = range.cloneRange();
      range.setStartAfter(lastNode);
      range.collapse(true);
      caret.removeAllRanges();
      caret.addRange(range);
    }
  },
});

class MediumEditorExtension extends BookmarkButton {
  constructor (options) {
    super();
    this.options = options;
  }
}

export default MediumEditorExtension;
