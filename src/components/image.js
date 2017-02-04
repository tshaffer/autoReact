// @flow

import React, { Component } from 'react';

export default class Image extends Component {

  render () {

    // desktop version
    const imgSrc = "file://" + this.props.filePath;

    // BrightSign device version
    // const imgSrc = "pool/" + this.props.filePath;

    let self = this;
    setTimeout(
      () => {
        self.props.onTimeout();
      },
      this.props.duration);

    return (
      <img
        src={imgSrc}
        width={this.props.width.toString()}
        height={this.props.height.toString()}
      />
    );
  }
}

Image.propTypes = {
  filePath: React.PropTypes.string.isRequired,
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  duration: React.PropTypes.number.isRequired,
  onTimeout: React.PropTypes.func.isRequired
};
