// @flow

import React, { Component } from 'react';

const xml2js = require('xml2js');

export default class RSSTicker extends Component {

  componentWillMount() {

    let self = this;

    console.log('RSSTicker::componentWillMount: ', this.props.feedUrl);

    fetch(this.props.feedUrl)
      .then( (response) => {
        let blobPromise = response.text();
        blobPromise.then( (content) => {
          let parser = new xml2js.Parser();
          try {
            parser.parseString(content, (err, jsonResponse) => {
              if (err) {
                console.log(err);
                debugger;
              }
              console.log(jsonResponse);
              // resolve(jsonResponse);
            });
          }
          catch (e) {
            console.log(e);
            debugger;
          }
        })
      }).catch( (err) => {
      console.log(err);
      debugger;
    });
  }

  render () {

    let self = this;

    return (
      <div>Loading...</div>
    );
  }
}

RSSTicker.propTypes = {
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  feedUrl: React.PropTypes.string.isRequired
};
