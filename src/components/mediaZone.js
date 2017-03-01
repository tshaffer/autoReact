// @flow

import React, { Component } from 'react';

import path from 'path';

import Image from './image';
import Video from './video';

import {
  ContentItemTypeName,
  dmGetHtmlSiteById,
  dmGetMediaStateById,
  dmGetZoneSimplePlaylist,
  dmGetEventIdsForMediaState,
  MediaType,
  EventTypeName,
  dmGetEventById,
} from '@brightsign/bsdatamodel';

export default class MediaZone extends Component {

  constructor(props : Object) {
    super(props);
    this.state = { stateIndex : 0 };
    this.numStates = 0;
  }

  state : Object;
  numStates : number;

  nextAsset() {
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

    mediaStateIds = dmGetZoneSimplePlaylist(bsdm, { id: zone.id });
    mediaState = dmGetMediaStateById(bsdm, { id : mediaStateIds[this.state.stateIndex]});
    this.numStates = mediaStateIds.length;

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

MediaZone.propTypes = {
  platform: React.PropTypes.string.isRequired,
  bsdm: React.PropTypes.object.isRequired,
  zone: React.PropTypes.object.isRequired,
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  zoneIndex: React.PropTypes.number.isRequired,
};
