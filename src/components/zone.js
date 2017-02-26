// @flow

import React, { Component } from 'react';

import Image from './image';
import Video from './video';
import RSSTicker from './rssTicker';

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

  setHtmlTimeout(htmlItem: Object) {

    let self = this;

    setTimeout(
      () => {
        self.nextAsset();
        // self.nextAsset.bind(self);
      },
      htmlItem.slideDelayInterval * 1000);
  }

  render () {

    let self = this;

    let { states } = this.props.playlist;

    const currentState = states[this.state.assetIndex];

    // src={'file:///Users/tedshaffer/Documents/Projects/autoReact/data/test.html'}
    // src={currentState.htmlItem.site.url}

    if (currentState.rssItem) {
      return (
        <RSSTicker
          platform={this.props.platform}
          width={this.props.width}
          height={this.props.height}
          feedUrl={currentState.rssItem.feedUrl}
        />
      )
    }
    else if (currentState.htmlItem) {

      this.setHtmlTimeout(currentState.htmlItem);

      // src={'file:///storage/sd/pool/test.html'}

      let resourceIdentifier;
      if (this.props.platform === 'desktop') {
        resourceIdentifier = currentState.htmlItem.site.url;
      }
      else {
        resourceIdentifier = 'pool/test.html';
      }

      return (
        <iframe
          width={this.props.width}
          height={this.props.height}
          src={resourceIdentifier}
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
