// @flow

import React, { Component } from 'react';

import Zone from './zone';

export default class Sign extends Component {

  render () {

    const styleTop = {
      position: 'absolute',
      left: '0px',
      top: '0px',
      width: '960px',
      height: '540px'
    };

    const styleBottom = {
      position: 'absolute',
      left: '960px',
      top: '540px',
      width: '960px',
      height: '540px'
    };

    const zones = this.props.sign.zones;

    zones[0].className = 'zoneTop';
    zones[0].style = styleTop;

    zones[1].className = 'zoneBottom';
    zones[1].style = styleBottom;

    // className={zone.className}

    return (
      <div>
        {
          zones.map( (zone, index) =>
            <div
              key={index}
              style={zone.style}
            >
              <Zone
                platform={this.props.platform}
                playlist={zone.playlist}
                x={Number(zone.position.x)}
                y={Number(zone.position.y)}
                width={Number(zone.position.width)}
                height={Number(zone.position.height)}
              />
            </div>
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
