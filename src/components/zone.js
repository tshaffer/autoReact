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

    const currentState = states[this.state.assetIndex];

    if (currentState.imageItem) {
      return (
        <Image
          filePath={currentState.imageItem.filePath}
          width={this.props.width}
          height={this.props.height}
          duration={currentState.imageItem.slideDelayInterval * 1000}
          onTimeout={self.nextAsset.bind(this)}
        />
      );
    }
    else if (currentState.videoItem) {
      return (
        <Video
          filePath={currentState.videoItem.filePath}
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
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
};
