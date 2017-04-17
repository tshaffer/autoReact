// @flow

import React, { Component } from 'react';
import { HSM, STTopEventHandler } from '../hsm/HSM';
import { HState } from '../hsm/HState';

import path from 'path';

import PlatformService from '../platform';

import ImageContainer from '../containers/imageContainer';
import VideoContainer from '../containers/videoContainer';
import Html from './html';

import {
  ContentItemType,
  dmGetHtmlSiteById,
  dmGetMediaStateById,
  dmGetEventIdsForMediaState,
  MediaType,
  EventTypeName,
  dmGetEventById,
  dmGetZoneById,
} from '@brightsign/bsdatamodel';

export default class MediaZone extends Component {

  constructor(props : Object) {
    super(props);

    this.constructHSM();
    this.initZoneHSM(props.bsdm, props.zone.id);
  }

  bsdm : Object;
  zoneId : string;
  stTop : Object;
  topState : Object;

  initZoneHSM(bsdm : Object, zoneId : string) {

    this.bsdm = bsdm;
    this.zoneId = zoneId;

    // this.stTop = new HState(this, "Top");
    debugger;
    this.stTop = HState;

    this.stTop.HStateEventHandler = STTopEventHandler;
    this.topState = this.stTop;

    this.constructorHandler = this.videoOrImagesZoneConstructor;
    this.initialPseudoStateHandler = this.videoOrImagesZoneGetInitialState;

    // build playlist
    this.bsdmZone = dmGetZoneById(bsdm, { id: zoneId });

    this.id = this.bsdmZone.id;
    this.name = this.bsdmZone.name;

    this.x = this.bsdmZone.absolutePosition.x;
    this.y = this.bsdmZone.absolutePosition.y;
    this.width = this.bsdmZone.absolutePosition.width;
    this.height = this.bsdmZone.absolutePosition.height;

    this.initialMediaStateId = this.bsdmZone.initialMediaStateId;
    // this.mediaStateIds = dmGetZoneSimplePlaylist(this.bsdm, { id: zoneId });
    this.mediaStates = [];

    // this.mediaStateIds.forEach( (mediaStateId, index) => {
    //   const bsdmMediaState = dmGetMediaStateById(bsdm, { id : mediaStateId});
    //   if (bsdmMediaState.contentItem.type === ContentItemType.Image) {
    //     newState = new ImageState(this, bsdmMediaState);
    //   }
    //   else if (bsdmMediaState.contentItem.type === ContentItemTypeName.Video) {
    //     newState = new VideoState(this, bsdmMediaState);
    //   }
    //   this.mediaStates.push(newState);
    //
    //   if (index > 0) {
    //     this.mediaStates[index - 1].setNextState(newState);
    //   }
    // });
    // this.mediaStates[this.mediaStates.length - 1].setNextState(this.mediaStates[0]);

    this.constructorFunction();

    this.initialize();

    // dispatch(setActiveState(this.activeState));

  }

  videoOrImagesZoneConstructor() {
    console.log("VideoOrImagesZoneConstructor invoked");

    // const mediaStateIds = dmGetZoneSimplePlaylist(this.bsdm, { id: this.zoneId });
    // should really look at initialMediaStateId, but the following should work for non interactive playlists
    this.activeState = this.mediaStates[0];
  }

  videoOrImagesZoneGetInitialState() {
    console.log("videoOrImagesZoneGetInitialState invoked");

    return this.activeState;
  }

  nextAsset() {
    let event = {
      'EventType' : 'timeoutEvent'
    };
    this.props.postMessage(event);
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
          <ImageContainer>
            stateMachine={this}
            resourceIdentifier={resourceIdentifier}
            width={this.props.width}
            height={this.props.height}
            duration={duration * 1000}
            onTimeout={self.nextAsset.bind(this)}
          </ImageContainer>
        );
      }
      // case MediaType.Image: {
      //   return (
      //     <ImageContainer
      //       resourceIdentifier={resourceIdentifier}
      //       width={this.props.width}
      //       height={this.props.height}
      //       duration={duration * 1000}
      //       onTimeout={self.nextAsset.bind(this)}
      //     />
      //   );
      // }
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

    const activeState = this.props.activeState;
    const mediaStateId : string = activeState.id;
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

Object.assign(MediaZone.prototype, HSM);

MediaZone.propTypes = {
  playbackState: React.PropTypes.string.isRequired,
  bsdm: React.PropTypes.object.isRequired,
  zone: React.PropTypes.object.isRequired,
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  // activeState: React.PropTypes.object.isRequired,
  postMessage: React.PropTypes.func.isRequired,
};
