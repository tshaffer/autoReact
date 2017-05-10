// @flow

import React, { Component } from 'react';

import path from 'path';

import PlatformService from '../platform';

import ImageContainer from '../containers/imageContainer';
import VideoContainer from '../containers/videoContainer';
import Html from './html';
import MrssDisplayItemContainer from '../containers/mrssDisplayItemContainer';


import {
  dmGetHtmlSiteById,
  dmGetMediaStateById,
  dmGetEventIdsForMediaState,
  dmGetEventById,
} from '@brightsign/bsdatamodel';

export default class MediaZone extends Component {

  nextAsset() {
    let event = {
      'EventType' : 'timeoutEvent'
    };
    this.props.postBSPMessage(event);
  }

  renderMediaItem(mediaContentItem: Object, event : Object) {

    let duration : number = 10;

    let self = this;

    const assetId = mediaContentItem.assetId;
    // TODO - HACK - need FileName!!
    const mediaType = mediaContentItem.type;

    const resourceIdentifier = path.basename(assetId);

    const eventName = event.type;
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
      case 'Image': {
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
      case 'Video': {
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

  renderMrssItem(mrssContentItem : Object) {

    let duration : number = 10;

    let self = this;

    debugger;
    const dataFeedId = mrssContentItem.dataFeedId;

    return (
      <MrssDisplayItemContainer
        dataFeedId={dataFeedId}
        width={this.props.width}
        height={this.props.height}
        duration={duration * 1000}
        onTimeout={self.nextAsset.bind(this)}
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
      case'Video':
      case 'Image': {
        return this.renderMediaItem(mediaContentItem, event);
      }
      case 'Html': {
        return this.renderHtmlItem(mediaContentItem);
      }
      case 'MrssFeed': {
        return this.renderMrssItem(mediaContentItem);
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
  activeMediaStateId: React.PropTypes.string.isRequired,
  postBSPMessage: React.PropTypes.func.isRequired,
};
