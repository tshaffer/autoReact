// @flow

import path from 'path';

import React, { Component } from 'react';

export default class Video extends Component {

  render () {

    let self = this;

    let src = '';
// $PlatformGlobal
    if (__PLATFORM__ === 'desktop') {
      src = path.join('file://', this.props.poolFilePath);
    }
    else {
      src = this.props.poolFilePath.substr(12);
    }
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
