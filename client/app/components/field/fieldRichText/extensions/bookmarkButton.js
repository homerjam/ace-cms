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

    this.base.trigger('blur', {}, this.base.elements[0]);

    this.options.bookmarkHtml(selection)
      .then((html) => {
        this.insertHtmlAtCaret(html);
        this.base.checkContentChanged();
      });
  },

  insertHtmlAtCaret(html) {
    let selection;
    let range;

    // IE9 and non-IE
    if (window.getSelection) {
      selection = window.getSelection();

      if (selection.getRangeAt && selection.rangeCount) {
        range = selection.getRangeAt(0);
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

        // Preserve the selection
        if (lastNode) {
          range = range.cloneRange();
          range.setStartAfter(lastNode);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }

    // IE < 9
    if (!window.getSelection && document.selection && document.selection.type !== 'Control') {
      document.selection.createRange().pasteHTML(html);
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
