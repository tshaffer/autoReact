// @flow

import React, { Component } from 'react';

import Image from './image';
import Video from './video';

export default class Zone extends Component {


  constructor(props: Object) {
    super(props);

    this.state = {
      assetIndex: 0
    };
  }

  state: Object;

  nextAsset() {

    let { states } = this.props.playlist;

    let index = this.state.assetIndex;
    index++;
    if (index >= states.length) {
      index = 0;
    }
    this.setState( { assetIndex: index });
  }

  render () {

    let self = this;

    // let { initialMediaStateId, initialMediaStateName, name, states, transitions } = this.props.playlist;
    let { states } = this.props.playlist;

    // TODO - should start with initialMediaState, not necessarily states[0]
    const currentState = states[this.state.assetIndex];
    console.log('render bs zone (again?)');

    let filePath = '';

    if (currentState.imageItem) {
      filePath = currentState.imageItem.filePath;
      return (
        <Image
          filePath={filePath}
          width={this.props.width}
          height={this.props.height}
          duration={3000}
          onTimeout={self.nextAsset.bind(this)}
        />
      );
    }
    else if (currentState.videoItem) {
      filePath = currentState.videoItem.filePath;
      return (
        <Video
          filePath={filePath}
          width={this.props.width}
          height={this.props.height}
          onVideoEnd={self.nextAsset.bind(this)}
        />
      );
    }
  }
}

Zone.propTypes = {
  playlist: React.PropTypes.object.isRequired,
  // x: React.PropTypes.number.isRequired,
  // y: React.PropTypes.number.isRequired,
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
};
