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

    let index: number = this.state.assetIndex;
    index++;
    if (index >= states.length) {
      index = 0;
    }
    this.setState( { assetIndex: index });
  }

  render () {

    let self = this;

    let { states } = this.props.playlist;

    const currentState = states[this.state.assetIndex];

    let htmlItem = null;

    if (htmlItem) {
      return (
        <iframe
          width={this.props.width}
          height={this.props.height}
          src={'file:///Users/tedshaffer/Documents/Projects/autoReact/data/test.html'}
        />
      );
    }
    else if (currentState.imageItem) {

      let resourceIdentifier;
      if (this.props.platform === 'desktop') {
        resourceIdentifier = "file://" + currentState.imageItem.filePath;
      }
      else {
        resourceIdentifier = "pool/" + currentState.imageItem.fileName;
      }

      return (
        <Image
          resourceIdentifier={resourceIdentifier}
          width={this.props.width}
          height={this.props.height}
          duration={currentState.imageItem.slideDelayInterval * 1000}
          onTimeout={self.nextAsset.bind(this)}
        />
      );
    }
    else if (currentState.videoItem) {

      let resourceIdentifier;
      if (this.props.platform === 'desktop') {
        resourceIdentifier = "file://" + currentState.videoItem.filePath;
      }
      else {
        resourceIdentifier = "pool/" + currentState.videoItem.fileName;
      }

      return (
        <Video
          resourceIdentifier={resourceIdentifier}
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
  platform: React.PropTypes.string.isRequired
};
