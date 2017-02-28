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
  }

  state : Object;

  nextAsset() {
    this.props.incrementStateIndex(this.props.zoneIndex);
  }

  setHtmlTimeout() {

    let self = this;

    setTimeout(
      () => {
        self.nextAsset();
      },
      4 * 1000);
  }


  render() {

    debugger;

    let bsdm : Object = this.props.bsdm;
    let platform = this.props.platform;

    let mediaStateIds : Array<string> = [];
    let mediaState : Object = {};

    let self = this;

    // get media state associated with this.state.stateIndex

    const zone = this.props.zone;

    let zoneType = ZoneTypeCompactName(zone.type);

    switch (zoneType) {
      case 'VideoOrImages': {
        mediaStateIds = dmGetZoneSimplePlaylist(bsdm, { id: zone.id });
        mediaState = dmGetMediaStateById(bsdm, { id : mediaStateIds[this.state.stateIndex]});
        break;
      }
      case 'Ticker': {
        debugger;
        // const mediaStateId = zone.initialMediaStateId;
        // mediaStateIds.push(mediaStateId);
        // const mediaState = dmGetMediaStateById(bsdm, { id : mediaStateId });
        // mediaStates.push(mediaState);
        break;
      }
      default: {
        debugger;
      }
    }


    let autorunState = {};
    let duration : number = 1;


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




    let assetId = '';
    let mediaType;


    const mediaStateContentItem = mediaState.contentItem;
    const mediaStateContentItemType = mediaStateContentItem.type;
    const contentItemType = ContentItemTypeName(mediaStateContentItemType).toLowerCase();
    switch (contentItemType) {
      case 'media': {
        const mediaObject = mediaStateContentItem.media;
        assetId = mediaObject.assetId;
        mediaType = mediaObject.mediaType;

        autorunState.mediaType = mediaObject.mediaType;

        switch (mediaType) {
          case MediaType.Image: {

            if (platform === 'desktop') {
              autorunState.resourceIdentifier = "file://" + assetId;
            }
            else {
              autorunState.resourceIdentifier = "pool/" + path.basename(assetId);
            }
            break;
          }
          case MediaType.Video: {

            if (platform === 'desktop') {
              autorunState.resourceIdentifier = "file://" + assetId;
            }
            else {
              autorunState.resourceIdentifier = "pool/" + path.basename(assetId);
            }
            break;
          }
          default: {
            debugger;
          }
        }







        break;
      }
      case 'html': {
        autorunState.displayCursor = mediaStateContentItem.displayCursor;
        autorunState.enableExternalData = mediaStateContentItem.enableExternalData;
        autorunState.enableMouseEvents = mediaStateContentItem.enableMouseEvents;
        autorunState.hwzOn = mediaStateContentItem.hwzOn;
        const htmlSiteId = mediaStateContentItem.siteId;
        const site = dmGetHtmlSiteById(bsdm, {id: htmlSiteId});

        // HACK
        if (platform === 'brightsign') {
          autorunState.url = 'pool/test.html';
        }
        else {
          autorunState.url = site.url;
        }
        break;
      }
      case 'mrssfeed': {
        debugger;
        break;
      }
      case 'datafeed': {

        let rssItem = {};

        let dataFeedId = mediaStateContentItem.dataFeedId;
        let dataFeed = dmGetDataFeedById(bsdm, {id: dataFeedId});
        const feedUrl = dmGetSimpleStringFromParameterizedString(dataFeed.url);
        rssItem.feedUrl = feedUrl;

        autorunState.rssItem = rssItem;

        break;
      }
      default: {
        break;
      }
    }


    // if (!this.props.autoplayZone.mediaStateIds && this.props.autoplayZone.mediaStateIds.length === 0) {
    //   return (
    //     <div>Loading</div>
    //   );
    // }

    // let autorunState = this.props.autoplayZone.autorunStates[this.props.autoplayZone.stateIndex];

    // let { contentItemType } = autorunState;


    switch (contentItemType) {

      case 'datafeed': {

        if (this.props.platform === 'brightsign') {
          return (
            <RSSTicker
              platform={this.props.platform}
              width={this.props.width}
              height={this.props.height}
              feedUrl={autorunState.rssItem.feedUrl}
            />
          );
        }
        else {
          return (
            <div>Ticker support lacking</div>
          );
        }
      }

      case 'media': {

        switch (mediaType) {
          case MediaType.Image: {

            const resourceIdentifier = autorunState.resourceIdentifier;

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

            const resourceIdentifier = autorunState.resourceIdentifier;

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

        this.setHtmlTimeout();

        return (
          <iframe
            width={this.props.width}
            height={this.props.height}
            src={autorunState.url}
          />
        );
      }

      default: {
        debugger;
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
