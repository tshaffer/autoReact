// @flow

import React, { Component } from 'react';

import Image from './image';
import Video from './video';
import RSSTicker from './rssTicker';

import {
  MediaType,
} from '@brightsign/bsdatamodel';


export default class Zone extends Component {

  nextAsset() {

    this.props.incrementStateIndex(this.props.zoneIndex);

    // let nextStateIndex = this.state.stateIndex + 1;
    // if (nextStateIndex >= this.state.autorunStates.length) {
    //   nextStateIndex = 0;
    // }
    // debugger;
    // this.setState( { stateIndex: nextStateIndex });
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

    if (!this.props.autoplayZone.mediaStateIds && this.props.autoplayZone.mediaStateIds.length === 0) {
      return (
        <div>Loading</div>
      );
    }

    let autorunState = this.props.autoplayZone.autorunStates[this.props.autoplayZone.stateIndex];

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

Zone.propTypes = {
  platform: React.PropTypes.string.isRequired,
  bsdm: React.PropTypes.object.isRequired,
  zone: React.PropTypes.object.isRequired,
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  autoplayZone: React.PropTypes.object.isRequired,
  incrementStateIndex: React.PropTypes.func.isRequired,
  zoneIndex: React.PropTypes.number.isRequired,
};
