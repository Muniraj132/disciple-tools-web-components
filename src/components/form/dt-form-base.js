import { css, html } from 'lit';
import DtBase from '../dt-base.js';
import 'element-internals-polyfill'; // eslint-disable-line import/no-extraneous-dependencies
import './dt-label/dt-label.js';

export default class DtFormBase extends DtBase {
  static get formAssociated() {
    return true;
  }

  static get styles() {
    return [
      css`
        .input-group {
          position: relative;
        }
        .input-group.disabled {
          background-color: var(--disabled-color);
        }

        /* === Inline Icons === */
        .icon-overlay {
          position: absolute;
          inset-inline-end: 3rem;
          top: -15%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .icon-overlay.alert {
          color: var(--alert-color);
          cursor: pointer;
        }
        .icon-overlay.success {
          color: var(--success-color);
        }
      `,
    ];
  }

  static get properties() {
    return {
      ...super.properties,
      name: { type: String },
      label: { type: String },
      icon: { type: String },
      iconAltText: { type: String },
      private: { type: Boolean },
      privateLabel: { type: String },
      disabled: { type: Boolean },
      required: { type: Boolean },
      requiredMessage: { type: String },
      touched: {
        type: Boolean,
        state: true,
      },
      invalid: {
        type: Boolean,
        state: true,
      },
      error: { type: String },
      loading: { type: Boolean },
      saved: { type: Boolean },
    };
  }

  /**
   * return the field elemnt
   */
  get _field() {
    return this.shadowRoot.querySelector('input, textarea, select');
  }

  /**
   * return the element to proxy focus to
   */
  get _focusTarget() {
    return this._field;
  }

  constructor() {
    super();
    this.touched = false;
    this.invalid = false;
    this.internals = this.attachInternals();

    // catch oninvalid event (when validation is triggered from form submit)
    // and set touched=true so that styles are shown
    this.addEventListener('invalid', () => {
      this.touched = true;
      this._validateRequired();
    });
  }

  firstUpdated(...args) {
    super.firstUpdated(...args);

    // set initial form value
    const formdata = DtFormBase._jsonToFormData(this.value, this.name);
    this.internals.setFormValue(formdata);
    this._validateRequired();
  }

  /**
   * Recursively create FormData from JSON data
   * @param formData
   * @param data
   * @param parentKey
   * @private
   */
  static _buildFormData(formData, data, parentKey) {
    if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File)) {
      Object.keys(data).forEach(key => {
        this._buildFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key);
      });
    } else {
      const value = data == null ? '' : data;
      formData.append(parentKey, value);
    }
  }

  /**
   * Convert JSON to FormData object
   * @param data
   * @param parentKey - prefix for all values. Should be the field name
   * @returns {FormData}
   * @private
   */
  static _jsonToFormData(data, parentKey) {
    const formData = new FormData();
    DtFormBase._buildFormData(formData, data, parentKey);
    return formData;
  }

  _setFormValue(value) {
    // handle complex types like arrays and objects by converting to FormData
    const formdata = DtFormBase._jsonToFormData(value, this.name);
    this.internals.setFormValue(formdata, value);
    this._validateRequired();
    this.touched = true;
  }

  /* eslint-disable class-methods-use-this */
  /**
   * Can/should be overriden by each component to implement logic for checking if a value is entered/selected
   * @private
   */
  _validateRequired() {
    // const { value } = this;
    // const input = this.shadowRoot.querySelector('input');
    // if (value === '' && this.required) {
    //   this.invalid = true;
    //   this.internals.setValidity({
    //     valueMissing: true
    //   }, this.requiredMessage || 'This field is required', input);
    // } else {
    //   this.invalid = false;
    //   this.internals.setValidity({});
    // }
  }
  /* eslint-enable class-methods-use-this */

  labelTemplate() {
    if (!this.label) {
      return '';
    }

    return html`
      <dt-label
        ?private=${this.private}
        privateLabel="${this.privateLabel}"
        iconAltText="${this.iconAltText}"
        icon="${this.icon}"
      >
        ${!this.icon
          ? html`<slot name="icon-start" slot="icon-start"></slot>`
          : null}
        ${this.label}
      </dt-label>
    `;
  }

  render() {
    return html`
      ${this.labelTemplate()}
      <slot></slot>
    `;
  }
}
