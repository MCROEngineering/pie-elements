import React from 'react';
import ReactDOM from 'react-dom';
import Main from './main';
import { ModelUpdatedEvent } from '@pie-framework/pie-configure-events';
import debug from 'debug';

const log = debug('pie-elements:ebsr:configure');

export default class EbsrConfigure extends HTMLElement {

  constructor() {
    super();
    this.onModelChanged = this.onModelChanged.bind(this);
  }

  set model(m) {
    this._model = m;
    this._render();
  }

  onModelChanged(model) {
    this._model = model;
    log('[onModelChanged]: ', this._model);
    this.dispatchEvent(new ModelUpdatedEvent(this._model, true));
  }

  _render() {
    if (this._model) {
      const el = React.createElement(Main, {
        model: this._model,
        onModelChanged: this.onModelChanged.bind(this),
      });

      ReactDOM.render(el, this);
    }
  }
}
