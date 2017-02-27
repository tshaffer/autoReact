// @flow

import path from 'path';

import React, { Component } from 'react';

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

  constructor(props: Object) {
    super(props);

    this.state = {
      zoneType: '',
      mediaStateIds: [],
      mediaStates: [],
      autorunStates: [],
      stateIndex: 0,
    };
  }

  state: Object;

  componentWillMount() {

    debugger;

    let mediaStateIds = [];
    let mediaStates = [];

    let zoneType = ZoneTypeCompactName(this.props.zone.type);
    this.setState( { zoneType });

    switch (zoneType) {
      case 'VideoOrImages': {
        mediaStateIds = dmGetZoneSimplePlaylist(this.props.bsdm, { id: this.props.zone.id });
        mediaStates = mediaStateIds.map( mediaStateId => {
          return dmGetMediaStateById(this.props.bsdm, { id : mediaStateId });
        });
        break;
      }
      case 'Ticker': {
        const mediaStateId = this.props.zone.initialMediaStateId;
        mediaStateIds.push(mediaStateId);
        const mediaState = dmGetMediaStateById(this.props.bsdm, { id : mediaStateId });
        mediaStates.push(mediaState);
        break;
      }
      default: {
        debugger;
      }
    }

    this.setState( { mediaStateIds });
    this.setState( { mediaStates });

    let autorunStates = [];

    mediaStates.forEach( mediaState => {

      let assetId = '';
      let mediaType;

      let autorunState = {};

      const mediaStateContentItem = mediaState.contentItem;
      const mediaStateContentItemType = mediaStateContentItem.type;
      const contentItemType = ContentItemTypeName(mediaStateContentItemType).toLowerCase();
      switch (contentItemType) {
        case 'media': {

          const mediaObject = mediaStateContentItem.media;

          assetId = mediaObject.assetId;
          mediaType = mediaObject.mediaType;
          break;
        }
        case 'html': {
          autorunState.displayCursor = mediaStateContentItem.displayCursor;
          autorunState.enableExternalData = mediaStateContentItem.enableExternalData;
          autorunState.enableMouseEvents = mediaStateContentItem.enableMouseEvents;
          autorunState.hwzOn = mediaStateContentItem.hwzOn;
          const htmlSiteId = mediaStateContentItem.siteId;
          const site = dmGetHtmlSiteById(this.props.bsdm, { id: htmlSiteId });

          // HACK
          if (this.props.platform === 'brightsign') {
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
          let dataFeed = dmGetDataFeedById(this.props.bsdm, { id: dataFeedId });
          const feedUrl = dmGetSimpleStringFromParameterizedString(dataFeed.url);
          rssItem.feedUrl = feedUrl;

          autorunState.rssItem = rssItem;

          break;
        }
        default: {
          break;
        }
      }

      let eventIds = dmGetEventIdsForMediaState(this.props.bsdm, { id : mediaState.id });
      if (eventIds.length !== 1) {
        debugger;
      }

      let event = dmGetEventById(this.props.bsdm, { id : eventIds[0] });
      if (!event) {
        debugger;
      }

      const eventName = EventTypeName(event.type);
      switch(eventName) {
        case 'Timer': {
          autorunState.duration = event.data.interval;
          break;
        }
        case 'MediaEnd': {
          break;
        }
        default: {
          debugger;
        }
      }

      autorunState.contentItemType = contentItemType;
      switch (contentItemType) {
        case 'media': {

          const mediaObject = mediaStateContentItem.media;

          autorunState.mediaType = mediaObject.mediaType;

          switch (mediaType) {
            case MediaType.Image: {

              if (this.props.platform === 'desktop') {
                autorunState.resourceIdentifier = "file://" + assetId;
              }
              else {
                autorunState.resourceIdentifier = "pool/" + path.basename(assetId);
              }
              break;
            }
            case MediaType.Video: {

              if (this.props.platform === 'desktop') {
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
        case 'datafeed': {
          console.log('datafeed in rss, anything to do here?');
          break;
        }
      }

      autorunStates.push(autorunState);
    });

    this.setState( { autorunStates });
  }

  nextAsset() {

    let nextStateIndex = this.state.stateIndex + 1;
    if (nextStateIndex >= this.state.autorunStates.length) {
      nextStateIndex = 0;
    }
    this.setState( { stateIndex: nextStateIndex });
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

    let self = this;

    if (!this.state.mediaStateIds && this.state.mediaStateIds.length === 0) {
      return (
        <div>Loading</div>
      );
    }

    // if (this.state.zoneType === 'Ticker') {
    //   return (
    //     <div>Ticker support pending</div>
    //   );
    // }

    let autorunState = this.state.autorunStates[this.state.stateIndex];

    let { contentItemType } = autorunState;

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

        let { mediaType, duration } = autorunState;

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

Zone.propTypes = {
  platform: React.PropTypes.string.isRequired,
  bsdm: React.PropTypes.object.isRequired,
  zone: React.PropTypes.object.isRequired,
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  autoplayZone: React.PropTypes.object.isRequired,
};
