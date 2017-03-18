// @flow

import React, { Component } from 'react';

import PlatformService from '../platform';

export default class Video extends Component {

  render () {

    let self = this;

    const src = PlatformService.default.getMediaSrc(this.props.poolFilePath);
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
  poolFilePath: React.PropTypes.string,
};

//  poolFilePath: React.PropTypes.string.isRequired,
