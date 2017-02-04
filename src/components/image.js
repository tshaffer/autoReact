// @flow

import React, { Component } from 'react';

export default class Image extends Component {

  render () {

    let self = this;
    setTimeout(
      () => {
        self.props.onTimeout();
      },
      this.props.duration);

    return (
      <img
        src={this.props.resourceIdentifier}
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
};
