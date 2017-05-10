// @flow

import React, { Component } from 'react';

import path from 'path';

import { bsp } from '../app/bsp';

export default class MrssDisplayItem extends Component {

  constructor(props : Object) {
    super(props);
    this.timeout = null;
  }

  timeout : ?number;

  render () {

    let self = this;

    this.timeout = setTimeout( () => {
      self.props.onTimeout();
    }
      ,this.props.duration);

    console.log(this.props.displayItem);
    const url = this.props.displayItem.link[0];
    const dataFeedId = this.props.dataFeedId;
    const dataFeed = bsp.dataFeeds[dataFeedId];
    const feedPoolAssetFiles = dataFeed.feedPoolAssetFiles;
    const imageFilePath = feedPoolAssetFiles[url];

    const src = path.join('file://', imageFilePath);
    console.log('mrssDisplayItem.js::render, image src: ' + src);

    return (
      <img
        src={src}
        width={this.props.width.toString()}
        height={this.props.height.toString()}
      />
    );
  }
}

MrssDisplayItem.propTypes = {
  dataFeedId: React.PropTypes.string.isRequired,
  displayItem : React.PropTypes.object.isRequired,
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  duration: React.PropTypes.number.isRequired,
  onTimeout: React.PropTypes.func.isRequired,
};
