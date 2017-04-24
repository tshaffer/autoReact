// @flow

import React, { Component } from 'react';

import path from 'path';

import { getPoolFilePath } from '../utilities/utilities';

export default class Video extends Component {

  render () {

    let self = this;

    const src = path.join('file://', getPoolFilePath(this.props.resourceIdentifier));
    console.log('video.js::render, video src: ' + src);

    return (
      <video
        src={src}
        autoPlay={true}
        width={this.props.width.toString()}
        height={this.props.height.toString()}
        type="video/mp4"
        onEnded = {() => {
          self.props.onVideoEnd();
        }
        }/>
    );
  }
}

Video.propTypes = {
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  onVideoEnd: React.PropTypes.func.isRequired,
  resourceIdentifier: React.PropTypes.string.isRequired,
};
