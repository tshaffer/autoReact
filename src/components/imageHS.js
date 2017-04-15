import React, { Component } from 'react';
import { HState } from '../hsm/HState';

const flibbet = {

  poop() {
    console.log('poop invoked');
  }

};

export default class ImageHS extends Component {

  constructor(props) {
    super(props);

    debugger;
    // this.constructHState(obj, id);
    this.constructHState({ poo: 'smelly' }, 'flibbet');
  }

  render() {

    return (
      <div>poo</div>
    );
  }
}

Object.assign(ImageHS.prototype, HState);
