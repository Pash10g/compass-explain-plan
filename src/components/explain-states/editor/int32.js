import chars from 'components/explain-states/utils';
import StandardEditor from 'components/explain-states/editor/standard';

/**
 * CRUD editor for int32 values.
 */
class Int32Editor extends StandardEditor {
  /**
   * Create the editor with the element.
   *
   * @param {Element} element - The hadron document element.
   */
  constructor(element) {
    super(element);
  }

  /**
   * Get the number of characters the value should display.
   *
   * @param {Boolean} editMode - If the element is being edited.
   *
   * @returns {Number} The number of characters.
   */
  size() {
    return chars(this.element.currentValue.valueOf());
  }
}

export default Int32Editor;
