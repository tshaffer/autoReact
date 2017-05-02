// @flow

import React, { Component } from 'react';

import PlatformService from '../platform';

import {
  ARLiveDataFeed
} from '../entities/liveDataFeed';

import RSSTicker from './rssTicker';

// import {
//   StringParameterType,
//   dmGetDataFeedById,
//   dmGetMediaStateById,
//   dmGetSimpleStringFromParameterizedString,
// } from '@brightsign/bsdatamodel';

export default class TickerZone extends Component {

  constructor(props : Object) {
    super(props);

    this.bsTicker = null;
  }

  componentDidMount() {

    if (PlatformService.default.isTickerSupported()) {

      let { left, top, width, height } = this.props;

      // $FlowBrightSignExternalObject
      this.bsTicker = new BSTicker(left, top, width, height, 0);
    }
  }

  bsTicker : ?Object;

  render() {

    let articles : Array<string> = [];

    if (this.props.dataFeeds.dataFeedsById && (Object.keys(this.props.dataFeeds.dataFeedsById).length > 0)) {

      for (let dataFeedId in this.props.dataFeeds.dataFeedsById) {
        if (this.props.dataFeeds.dataFeedsById.hasOwnProperty(dataFeedId)) {
          const dataFeed : ARLiveDataFeed = this.props.dataFeeds.dataFeedsById[dataFeedId];
          dataFeed.rssItems.forEach( (rssItem) => {
            articles.push(rssItem.title);
          });
        }
      }
    }
    else {
      return (
        <div>data feed not loaded yet</div>
      );
    }

    return (
      <RSSTicker
        width={this.props.width}
        height={this.props.height}
        articles={articles}
        bsTicker={this.bsTicker}
      />
    );

      //   const bsdm = this.props.bsdm;
  //   const mediaStateId = this.props.zone.initialMediaStateId;
  //
  //   const mediaState = dmGetMediaStateById(bsdm, { id : mediaStateId });
  //   const dataFeedContentItem = mediaState.contentItem;
  //
  //   const dataFeedId = dataFeedContentItem.dataFeedId;
  //   const dataFeed = dmGetDataFeedById(bsdm, {id: dataFeedId});
  //   const feedUrl = dmGetSimpleStringFromParameterizedString(dataFeed.url);
  //
  //   if (PlatformService.default.isTickerSupported()) {
  //     return (
  //       <RSSTicker
  //         playbackState={this.props.playbackState}
  //         width={this.props.width}
  //         height={this.props.height}
  //         feedUrl={feedUrl}
  //       />
  //     );
  //   }
  //   else {
  //     return (
  //       <div>Ticker support lacking</div>
  //     );
  //   }
  }
}

TickerZone.propTypes = {
  playbackState: React.PropTypes.string.isRequired,
  bsdm: React.PropTypes.object.isRequired,
  zone: React.PropTypes.object.isRequired,
  left: React.PropTypes.number.isRequired,
  top: React.PropTypes.number.isRequired,
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  dataFeeds: React.PropTypes.object.isRequired,
};
