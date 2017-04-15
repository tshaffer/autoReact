// @flow

import React, { Component } from 'react';
import { HSM } from '../hsm/HSM';

import ImageHS from '../components/imageHS';

export default class MediaZoneHSM extends Component {

  constructor(props) {

    super(props);

    debugger;

    this.constructHSM({ poop: 'large' }, 'grog');
  }

  render() {
    return (
      <div>
        <ImageHS/>
      </div>
    );
  }
}

Object.assign(MediaZoneHSM.prototype, HSM);

