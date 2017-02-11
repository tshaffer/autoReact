// @flow

import React, { Component } from 'react';

import Zone from './zone';

export default class Sign extends Component {

  render () {

    // const zone: Object = this.props.sign.zones[0];
    //
    // return (
    //   <div>
    //     <Zone
    //       platform={this.props.platform}
    //       playlist={zone.playlist}
    //       x={Number(zone.position.x)}
    //       y={Number(zone.position.y)}
    //       width={Number(zone.position.width)}
    //       height={Number(zone.position.height)}
    //     />
    //   </div>
    // );

    const zones = this.props.sign.zones;

    return (
      <div>
        {
          zones.map( (zone, index) =>
            <Zone
              key={index}
              platform={this.props.platform}
              playlist={zone.playlist}
              x={Number(zone.position.x)}
              y={Number(zone.position.y)}
              width={Number(zone.position.width)}
              height={Number(zone.position.height)}
            />
          )
        }
      </div>
    );
  }
}

Sign.propTypes = {
  sign: React.PropTypes.object.isRequired,
  platform: React.PropTypes.string.isRequired
};
