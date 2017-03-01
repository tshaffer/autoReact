// @flow

import React, { Component } from 'react';

import path from 'path';

import Image from './image';
import Video from './video';
import RSSTicker from './rssTicker';

import {
  StringParameterType,
  dmGetDataFeedById,
  ContentItemTypeName,
  dmGetHtmlSiteById,
  dmGetMediaStateById,
  dmGetZoneSimplePlaylist,
  dmGetEventIdsForMediaState,
  MediaType,
  EventTypeName,
  dmGetEventById,
  ZoneTypeCompactName,
} from '@brightsign/bsdatamodel';

export default class Zone extends Component {

  constructor(props : Object) {
    super(props);
    this.state = { stateIndex : 0 };
    this.numStates = 0;
  }

  state : Object;
  numStates : number;

  nextAsset() {
    // this.props.incrementStateIndex(this.props.zoneIndex);
    let stateIndex = this.state.stateIndex + 1;
    if (stateIndex >= this.numStates) {
      stateIndex = 0;
    }

    this.setState( { stateIndex });
  }

  setHtmlTimeout() {

    let self = this;

    setTimeout(
      () => {
        self.nextAsset();
      },
      4 * 1000);
  }


  renderTickerItem( bsdm: Object, mediaStateId : string) {

    this.numStates = 1;

    const mediaState = dmGetMediaStateById(bsdm, { id : mediaStateId });
    const mediaStateContentItem = mediaState.contentItem;

    const dataFeedId = mediaStateContentItem.dataFeedId;
    const dataFeed = dmGetDataFeedById(bsdm, {id: dataFeedId});
    const feedUrl = dmGetSimpleStringFromParameterizedString(dataFeed.url);

    if (this.props.platform === 'brightsign') {
      return (
        <RSSTicker
          platform={this.props.platform}
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

  render() {

    let assetId = '';
    let mediaType : string = '';
    let mediaStateIds : Array<string> = [];
    let mediaState : Object = {};
    let duration : number = 1;

    const self = this;
    const platform : string = this.props.platform;
    const bsdm : Object = this.props.bsdm;
    const zone = this.props.zone;

    switch (ZoneTypeCompactName(zone.type)) {
      case 'VideoOrImages': {
        mediaStateIds = dmGetZoneSimplePlaylist(bsdm, { id: zone.id });
        mediaState = dmGetMediaStateById(bsdm, { id : mediaStateIds[this.state.stateIndex]});
        this.numStates = mediaStateIds.length;
        break;
      }
      case 'Ticker': {
        return this.renderTickerItem(bsdm, zone.initialMediaStateId);
      }
      default: {
        debugger;
      }
    }

    let eventIds = dmGetEventIdsForMediaState(bsdm, { id : mediaState.id });
    if (eventIds.length !== 1) {
      debugger;
    }

    let event = dmGetEventById(bsdm, { id : eventIds[0] });
    if (!event) {
      debugger;
    }

    const eventName = EventTypeName(event.type);
    switch(eventName) {
      case 'Timer': {
        duration = event.data.interval;
        break;
      }
      case 'MediaEnd': {
        break;
      }
      default: {
        debugger;
      }
    }

    const mediaStateContentItem = mediaState.contentItem;
    const mediaStateContentItemType = mediaStateContentItem.type;
    const contentItemType = ContentItemTypeName(mediaStateContentItemType).toLowerCase();
    switch (contentItemType) {
      case 'media': {
        const mediaObject = mediaStateContentItem.media;
        assetId = mediaObject.assetId;
        mediaType = mediaObject.mediaType;

        let resourceIdentifier = '';
        if (platform === 'desktop') {
          resourceIdentifier = "file://" + assetId;
        }
        else {
          resourceIdentifier = "pool/" + path.basename(assetId);
        }

        switch (mediaType) {
          case MediaType.Image: {
            return (
              <Image
                resourceIdentifier={resourceIdentifier}
                width={this.props.width}
                height={this.props.height}
                duration={duration * 1000}
                onTimeout={self.nextAsset.bind(this)}
              />
            );
          }
          case MediaType.Video: {
            return (
              <Video
                resourceIdentifier={resourceIdentifier}
                width={this.props.width}
                height={this.props.height}
                onVideoEnd={self.nextAsset.bind(this)}
              />
            );
          }
          default: {
            debugger;
          }
        }
        break;
      }
      case 'html': {

        // displayCursor = mediaStateContentItem.displayCursor;
        // enableExternalData = mediaStateContentItem.enableExternalData;
        // enableMouseEvents = mediaStateContentItem.enableMouseEvents;
        // hwzOn = mediaStateContentItem.hwzOn;

        const htmlSiteId = mediaStateContentItem.siteId;
        const site = dmGetHtmlSiteById(bsdm, {id: htmlSiteId});

        // HACK
        let url = '';
        if (platform === 'brightsign') {
          url = 'pool/test.html';
        }
        else {
          url = site.url;
        }

        this.setHtmlTimeout();

        return (
          <iframe
            width={this.props.width}
            height={this.props.height}
            src={url}
          />
        );
      }
      default: {
        break;
      }
    }
  }
}

Zone.propTypes = {
  platform: React.PropTypes.string.isRequired,
  bsdm: React.PropTypes.object.isRequired,
  zone: React.PropTypes.object.isRequired,
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  incrementStateIndex: React.PropTypes.func.isRequired,
  zoneIndex: React.PropTypes.number.isRequired,
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
