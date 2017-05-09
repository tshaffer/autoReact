// @flow

import React, { Component } from 'react';

export default class MrssDisplayItem extends Component {

  constructor(props : Object) {
    super(props);
    this.timeout = null;
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

    return (
      <div>foo</div>
    );
    // const src = path.join('file://', getPoolFilePath(this.props.resourceIdentifier));
    // console.log('image.js::render, image src: ' + src);
    //
    // return (
    //   <img
    //     src={src}
    //     width={this.props.width.toString()}
    //     height={this.props.height.toString()}
    //   />
    // );
  }

}

MrssDisplayItem.propTypes = {
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  duration: React.PropTypes.number.isRequired,
  onTimeout: React.PropTypes.func.isRequired,
};
