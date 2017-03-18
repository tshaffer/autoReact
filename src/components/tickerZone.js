// @flow

import React, { Component } from 'react';

import PlatformService from '../platform';

import RSSTicker from './rssTicker';

import {
  StringParameterType,
  dmGetDataFeedById,
  dmGetMediaStateById,
} from '@brightsign/bsdatamodel';

export default class TickerZone extends Component {

  render() {

    const bsdm = this.props.bsdm;
    const mediaStateId = this.props.zone.initialMediaStateId;

    const mediaState = dmGetMediaStateById(bsdm, { id : mediaStateId });
    const dataFeedContentItem = mediaState.contentItem;

    const dataFeedId = dataFeedContentItem.dataFeedId;
    const dataFeed = dmGetDataFeedById(bsdm, {id: dataFeedId});
    const feedUrl = dmGetSimpleStringFromParameterizedString(dataFeed.url);

    if (PlatformService.default.isTickerSupported()) {
      return (
        <RSSTicker
          playbackState={this.props.playbackState}
          width={this.props.width}
          height={this.props.height}
          feedUrl={feedUrl}
        />
      );
    }
    else {
      return (
        <div>Ticker support lacking</div>
      );
    }
  }
}

TickerZone.propTypes = {
  playbackState: React.PropTypes.string.isRequired,
  bsdm: React.PropTypes.object.isRequired,
  zone: React.PropTypes.object.isRequired,
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
};

const dmGetSimpleStringFromParameterizedString = (ps) => {
  let returnString = undefined;
  if (typeof ps === "object" && ps.params && ps.params.length) {
    ps.params.every(param => {
      if (param.type === StringParameterType.UserVariable) {
        returnString = undefined;
        return false;
      }
      if (returnString) {
        returnString = returnString + param.value;
      } else {
        returnString = param.value;
      }
      return true;
    });
  }
  return returnString;
};
