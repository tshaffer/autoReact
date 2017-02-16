// @flow

import React, { Component } from 'react';

export default class RSSTicker extends Component {

  componentWillMount() {

    let self = this;

    console.log('RSSTicker::componentWillMount: ', this.props.feedUrl);

    fetch(this.props.feedUrl)
      .then( (response) => {
        let blobPromise = response.text();
        blobPromise.then( (content) => {
          debugger;
        })


        // let blobPromise = response.blob();
        // blobPromise.then( (blobData) => {
        //   let reader = new FileReader();
        //   reader.addEventListener('loadend', function() {
        //     const buf = self.toBuffer(reader.result);
        //     debugger;
        //     // nodeWrappers.writeFile(destinationFilePath, buf).then( () => {
        //     //   resolve();
        //     // }).catch( (err) => {
        //     //   reject(err);
        //     // });
        //   });
        //   reader.readAsArrayBuffer(blobData);
        // });
      }).catch( (err) => {
      console.log(err);
      debugger;
    });
  }

  // From ArrayBuffer to Buffer
  toBuffer(ab) {
    let buf = new Buffer(ab.byteLength);
    let view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
      buf[i] = view[i];
    }
    return buf;
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
