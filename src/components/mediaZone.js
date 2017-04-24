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
  // dmGetZoneSimplePlaylist,
  dmGetEventIdsForMediaState,
  MediaType,
  EventTypeName,
  dmGetEventById,
} from '@brightsign/bsdatamodel';

import { myBSP } from '../app/bsp';

export default class MediaZone extends Component {

  nextAsset() {
    let event = {
      'EventType' : 'timeoutEvent'
    };
    myBSP.store.dispatch(myBSP.postMessage(event));
    // this.props.postMessage(event);
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

    const mediaStateId : string = this.props.activeMediaStateId;
    const mediaState : Object = dmGetMediaStateById(this.props.bsdm, { id : mediaStateId });
    const event = this.getEvent(this.props.bsdm, mediaState.id);
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
  // postMessage: React.PropTypes.func.isRequired,
  activeMediaStateId: React.PropTypes.string.isRequired
};
