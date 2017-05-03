// @flow

// http://docs.brightsign.biz/display/DOC/BSTicker

import React, { Component } from 'react';

export default class RSSTicker extends Component {

  render () {

    if (this.props.articles && this.props.articles.length > 0 && this.props.bsTicker) {
      console.log('RENDER REAL TICKER');
      this.props.bsTicker.SetPixelsPerSecond(400);
      this.props.articles.forEach( (article) => {
        this.props.bsTicker.AddString(article);
      });
      return ( null );
    }
    else {
      return (
        <div>Loading...</div>
      );
    }
  }
}

RSSTicker.propTypes = {
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  // feedUrl: React.PropTypes.string.isRequired
  articles: React.PropTypes.array.isRequired,
  bsTicker: React.PropTypes.object,
};
