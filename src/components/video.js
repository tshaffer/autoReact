// @flow

import React, { Component } from 'react';

export default class Video extends Component {

  render () {

    // desktop version
    const videoSrc = "file://" + this.props.filePath;

    // BrightSign device version
    // const imgSrc = "pool/" + this.props.filePath;

    let self = this;
    return (
      <video
        src={videoSrc}
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
  filePath: React.PropTypes.string.isRequired,
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  onVideoEnd: React.PropTypes.func.isRequired
};
