// @flow

import React, { Component } from 'react';

import path from 'path';

import ImageContainer from '../containers/imageContainer';
import VideoContainer from '../containers/videoContainer';
import Html from './html';

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

  renderMediaItem(mediaStateContentItem: Object, event : Object) {

    let duration : number = 10;

    let self = this;

    const mediaObject = mediaStateContentItem.media;

    // TODO - HACK? HACK?
    // const assetId = mediaObject.assetId;
    const assetId = mediaObject.path;

    // TODO - HACK - need FileName!!

    const mediaType = mediaObject.mediaType;

    let resourceIdentifier = '';
// $PlatformGlobal
    if (__PLATFORM__ === 'desktop') {
      // resourceIdentifier = "file://" + assetId;
      resourceIdentifier = path.basename(assetId);
    }
    else {
      // resourceIdentifier = "pool/" + path.basename(assetId);
      resourceIdentifier = path.basename(assetId);
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

    switch (mediaType) {
      case MediaType.Image: {
        return (
          <ImageContainer
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
          <VideoContainer
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
  }

  renderHtmlItem(htmlContentItem : Object) {

    // displayCursor = mediaStateContentItem.displayCursor;
    // enableExternalData = mediaStateContentItem.enableExternalData;
    // enableMouseEvents = mediaStateContentItem.enableMouseEvents;
    // hwzOn = mediaStateContentItem.hwzOn;

    const htmlSiteId = htmlContentItem.siteId;
    const site = dmGetHtmlSiteById(this.props.bsdm, {id: htmlSiteId});

    let url = '';
// $PlatformGlobal
    if (__PLATFORM__ === 'brightsign') {
      // HACK
      url = 'pool/test.html';
    }
    else {
      url = site.url;
    }

    return (
      <Html
        width={this.props.width}
        height={this.props.height}
        url={url}
        onTimeout={this.nextAsset.bind(this)}
      />
    );
  }

  getEvent( bsdm : Object, mediaStateId: string ) {

    let eventIds = dmGetEventIdsForMediaState(bsdm, { id : mediaStateId });
    if (eventIds.length !== 1) {
      debugger;
    }

    let event = dmGetEventById(bsdm, { id : eventIds[0] });
    if (!event) {
      debugger;
    }

    return event;
  }


  render() {

    let mediaStateIds : Array<string> = [];
    let mediaState : Object = {};

    const bsdm : Object = this.props.bsdm;
    const zone = this.props.zone;

    mediaStateIds = dmGetZoneSimplePlaylist(bsdm, { id: zone.id });
    mediaState = dmGetMediaStateById(bsdm, { id : mediaStateIds[this.state.stateIndex]});
    this.numStates = mediaStateIds.length;

    const event = this.getEvent(bsdm, mediaState.id);

    const mediaStateContentItem = mediaState.contentItem;
    const contentItemType = ContentItemTypeName(mediaStateContentItem.type).toLowerCase();

    switch (contentItemType) {
      case 'media': {
        return this.renderMediaItem(mediaStateContentItem, event);
      }
      case 'html': {
        return this.renderHtmlItem(mediaStateContentItem);
      }
      default: {
        break;
      }
    }
  }
}

MediaZone.propTypes = {
  playbackState: React.PropTypes.string.isRequired,
  bsdm: React.PropTypes.object.isRequired,
  zone: React.PropTypes.object.isRequired,
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  zoneIndex: React.PropTypes.number.isRequired,
};
