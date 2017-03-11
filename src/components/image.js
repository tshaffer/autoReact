// @flow

import path from 'path';

import React, { Component } from 'react';

export default class Image extends Component {

  constructor(props : Object) {
    super(props);
    this.timeout = null;
  }

  shouldComponentUpdate() {

    if (this.timeout) {
      return false;
    }
    return true;
  }

  timeout : ?number;

  render () {

    let self = this;

    if (this.timeout) {
      debugger;
    }

    this.timeout = setTimeout( () => {
      this.timeout = null;
      self.props.onTimeout();
    }
      ,this.props.duration);

    // old code (desktop)
    //     const src = path.join('file://', this.props.poolFilePath);
    const src = this.props.poolFilePath.substr(12);
    console.log('image.js::render, image src: ' + src);

    return (
      <img
        src={src}
        width={this.props.width.toString()}
        height={this.props.height.toString()}
      />
    );
  }
}

Image.propTypes = {
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  duration: React.PropTypes.number.isRequired,
  onTimeout: React.PropTypes.func.isRequired,
  resourceIdentifier: React.PropTypes.string.isRequired,
  poolFilePath: React.PropTypes.string.isRequired,
};
