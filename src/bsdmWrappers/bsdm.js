/* @flow */

import {
  ContentItemType,
  DataFeedType,
} from '@brightsign/bscore';

import {
  dmGetParameterizedStringFromString,
  // dmAddDataFeed,
  dmAddBsnDataFeed,
  dmCreateMrssDataFeedContentItem,
  dmPlaylistAppendMediaState,
  dmGetZonesForSign,
  dmGetZoneById,
  dmGetZoneMediaStateContainer,
} from '@brightsign/bsdatamodel';

export class bsdmObject {
  constructor( id : string, name : string) {
    this.id = id;
    this.name = name;
  }

  id : string;
  name : string;
}

// export class bsdmStringParameterType {
//   constructor( text : string, userVariable : string) {
//     this.text = text;
//     this.userVariable = userVariable;
//   }
// }
//
// export class bsdmStringComponent {
//   constructor(type : bsdmStringParameterType, value : string) {
//     this.type = type;
//     this.value = value;
//   }
// }

export class bsdmParameterizedString {
  constructor(stringParameter : string) {
    this.dmParameterizedString = dmGetParameterizedStringFromString(stringParameter);
  }

  dmParameterizedString : Object;
}



export interface IAddBSNDataFeed {
  addBSNDataFeed : (name : string, dataFeedType : string, url : Object, bsnId : number,
                    bsnName : string, usage : string, updateInterval : number) => Object;
  // addBSNDataFeed(name : string, dataFeedType : string, url : Object, bsnId : number,
  //                bsnName : string, usage : string, updateInterval : number): Object;
}

export class BSNDataFeedAdder {
  addBSNDataFeed(name : string, dataFeedType : string, url : Object, bsnId : number,
                 bsnName : string, usage : string, updateInterval : number) {
    const action = dmAddBsnDataFeed(name, dataFeedType, url,
      bsnId, bsnName, usage, updateInterval);

    return action;
  }
}

export class bsdmDataFeed {
  constructor(name : string, url : bsdmParameterizedString,
              bsnId : number, bsnName : string,
              usage : string, updateInterval : number, useHeadRequest: boolean = false,
              parserPlugin : string = '', autoGenerateUserVariables : boolean = false,
              userVariableAccess : string = 'Shared') {
    this.name = name;
    this.url = url;
    this.bsnId = bsnId;
    this.bsnName = bsnName;
    this.usage = usage;
    this.updateInterval = updateInterval;
    this.useHeadRequest = useHeadRequest;
    this.parserPlugin = parserPlugin;
    this.autoGenerateUserVariables = autoGenerateUserVariables;
    this.userVariableAccess = userVariableAccess;
  }

  name : string;
  url : bsdmParameterizedString;
  bsnId : number;
  bsnName : string;
  usage : string;
  updateInterval : number;
  useHeadRequest : boolean;
  parserPlugin : string;
  autoGenerateUserVariables : boolean;
  userVariableAccess : string;


  // BSN only for now
  getAddDataFeedToBSDMAction() {

    const action = dmAddBsnDataFeed(this.name, DataFeedType.BSNDynamicPlaylist, this.url.dmParameterizedString,
      this.bsnId, this.bsnName, this.usage, this.updateInterval);

    return action;
  }


}

export class bsdmContentItem {
  constructor(name : string, type : string) {
    this.name = name;
    this.type = type;
  }

  name : string;
  type : string;
}

export class bsdmDataFeedContentItem extends bsdmContentItem {
  constructor(name : string, type : string, dataFeedId : string) {
    super(name, type);
    this.dataFeedId = dataFeedId;
  }

  name : string;
  type : string;
  dataFeedId : string;
}

export class bsdmMrssDataFeedContentItem extends bsdmDataFeedContentItem {
  constructor(name : string, dataFeedId : string, videoPlayerRequired : boolean) {
    super(name, ContentItemType.MrssFeed, dataFeedId);
    this.dataFeedId = dataFeedId;
    this.videoPlayerRequired = videoPlayerRequired;
    this.mrssDataFeedContentItem = dmCreateMrssDataFeedContentItem(name, dataFeedId, videoPlayerRequired);
  }

  dataFeedId : string;
  videoPlayerRequired : boolean;
  mrssDataFeedContentItem : Object;
}

// needs rework
export class bsdmState {

  constructor(bsdm : Object) {
    this.bsdm = bsdm;
    this.zoneIds = dmGetZonesForSign(bsdm);
    this.zones = [];
    this.zoneIds.forEach( (zoneId) => {
      this.zones.push(dmGetZoneById(bsdm, { id: zoneId }));
    });
  }

  bsdm : Object;
  zoneIds : Array<string>;
  zones : Array<Object>;

  getZoneMediaStateContainer(zoneId : string) : Object {
    const dmMediaStateContainer = dmGetZoneMediaStateContainer(zoneId);
    return dmMediaStateContainer;
  }

  appendMediaState(container : Object,
                   contentItem : bsdmContentItem,
                   name : string = '',
                   transitionType : ?Object = null,
                   eventType : ?Object = null,
                   eventData : ?Object = null) {
    const action = dmPlaylistAppendMediaState(container, contentItem, name, transitionType, eventType, eventData);
    return action;
  }
}