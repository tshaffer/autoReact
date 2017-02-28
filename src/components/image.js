// @flow

import React, { Component } from 'react';

export default class Image extends Component {

  constructor(props : Object) {
    super(props);
    this.timeout = null;
  }

  timeout : ?number;

  shouldComponentUpdate(_, __) {

    console.log('shouldComponentRender called for zone: ', this.props);
    console.log('this.timeout: ', this.timeout);

    if (this.timeout) {
      return false;
    }
    return true;
  }

  render () {

    console.log('image.js::render invoked: ', this.props);

    let self = this;

    if (this.timeout) {
      debugger;
    }

    this.timeout = setTimeout( () => {
      console.log('image.js::render timeout occurred: ', self.props);
      this.timeout = null;
      self.props.onTimeout();
    }
      ,this.props.duration);

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
