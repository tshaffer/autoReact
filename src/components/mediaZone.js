// @flow

import React, { Component } from 'react';

import path from 'path';

import PlatformService from '../platform';

import ImageContainer from '../containers/imageContainer';
import VideoContainer from '../containers/videoContainer';
import Html from './html';

import {
  ContentItemType,
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

    console.log("mediaZone::constructor invoked");

    this.state = { stateIndex : 0 };
    this.numStates = 0;
  }

  state : Object;
  numStates : number;

  nextAsset() {

    let stateIndex = 0;

    console.log('nextAsset invoked');
    if (this.props.playbackState !== 'active') {
      stateIndex = 0;
      this.setState( { stateIndex });
      console.log('nextAsset: exit prematurely');
      return;
    }

    stateIndex = this.state.stateIndex + 1;
    if (stateIndex >= this.numStates) {
      stateIndex = 0;
    }

    this.setState( { stateIndex });
  }

  renderMediaItem(mediaContentItem: Object, event : Object) {

    let duration : number = 10;

    let self = this;

    const assetId = mediaContentItem.assetId;
    // TODO - HACK - need FileName!!
    const mediaType = mediaContentItem.type;

    const resourceIdentifier = path.basename(assetId);

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

    const url = PlatformService.defaults.getHtmlSiteUrl(site);

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

    console.log('mediaZone.js::render invoked');

    if (this.props.playbackState !== 'active') {
      return (
        <div>Playback state inactive</div>
      );
    }

    const bsdm : Object = this.props.bsdm;
    const zone = this.props.zone;
    const activeState = this.props.activeState;

    let mediaStateIds : Array<string> = [];
    let mediaState : Object = {};

    mediaStateIds = dmGetZoneSimplePlaylist(bsdm, { id: zone.id });
    mediaState = dmGetMediaStateById(bsdm, { id : mediaStateIds[this.state.stateIndex]});
    this.numStates = mediaStateIds.length;

    const event = this.getEvent(bsdm, mediaState.id);

    const mediaContentItem = mediaState.contentItem;

    switch(mediaContentItem.type) {
      case ContentItemType.Video:
      case ContentItemType.Image: {
        return this.renderMediaItem(mediaContentItem, event);
      }
      case ContentItemType.Html: {
        return this.renderHtmlItem(mediaContentItem);
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
  // activeState: React.PropTypes.object.isRequired
  // zoneIndex: React.PropTypes.number.isRequired,
};
