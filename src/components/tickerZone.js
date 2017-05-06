// @flow

import React, { Component } from 'react';

import PlatformService from '../platform';

import {
  ARLiveDataFeed
} from '../entities/liveDataFeed';

// import RSSTicker from './rssTicker';

import {
  ContentItemType
} from '@brightsign/bscore';

import {
  dmGetMediaStateIdsForZone,
  dmGetMediaStateById,
} from '@brightsign/bsdatamodel';

export default class TickerZone extends Component {

  constructor(props : Object) {
    super(props);

    this.bsTicker = null;
  }

  componentDidMount() {

    if (PlatformService.default.isTickerSupported()) {

      let { left, top, width, height } = this.props;

      // $FlowBrightSignExternalObject
      this.bsTicker = new BSTicker(left, top, width, height, 0);
      this.bsTicker.SetPixelsPerSecond(400);
    }
  }

  bsTicker : ?Object;

  shouldComponentUpdate(nextProps, nextState) {

    console.log('nextProps: ');
    console.log(nextProps);
    console.log('nextState: ');
    console.log(nextState);

    const currentArticles = this.props.articles;
    const nextArticles = nextProps.articles;
    if (currentArticles.length !== nextArticles.length) return true;
    currentArticles.forEach( (currentArticle, index) => {
      const nextArticle = nextArticles[index];
      if (nextArticle !== currentArticle) return true;
    });

    console.log('shouldComponentUpdate: return FALSE');

    return false;
  }

  render() {

    console.log('TickerZone:: RENDER INVOKED');

    if (this.bsTicker) {
      this.props.articles.forEach( (article) => {
        this.bsTicker.AddString(article);
      });
    }

    return null;
  }
}

TickerZone.propTypes = {
  playbackState: React.PropTypes.string.isRequired,
  bsdm: React.PropTypes.object.isRequired,
  zone: React.PropTypes.object.isRequired,
  left: React.PropTypes.number.isRequired,
  top: React.PropTypes.number.isRequired,
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  dataFeeds: React.PropTypes.object.isRequired,
  articles: React.PropTypes.array.isRequired,
};
