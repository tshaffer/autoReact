// @flow

import React, { Component } from 'react';

export default class Html extends Component {

  setTimeout() {

    let self = this;

    setTimeout(
      () => {
        self.props.onTimeout();
      },
      4 * 1000);
  }

  render () {

    this.setTimeout();

    return (
      <iframe
        width={this.props.width}
        height={this.props.height}
        src={this.props.url}
      />
    );
  }
}

Html.propTypes = {
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  url: React.PropTypes.string.isRequired,
  onTimeout: React.PropTypes.func.isRequired,
};
