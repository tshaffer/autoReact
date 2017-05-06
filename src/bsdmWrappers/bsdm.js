/* @flow */

import {
  dmGetParameterizedStringFromString,
  dmAddDataFeed,
} from '@brightsign/bsdatamodel';

export class bsdmObject {
  constructor( id : string, name : string) {
    this.id = id;
    this.name = name;
  }
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
}
// export class bsdmDataFeed {
//   constructor() {
//     console.log('poo');
//   }
// }

export class bsdmDataFeed {
  constructor(name : string, url : bsdmParameterizedString,
              usage : string, updateInterval : number, useHeadRequest: boolean = false,
              parserPlugin : string = '', autoGenerateUserVariables : boolean = false,
              userVariableAccess : string = 'Shared') {
    this.name = name;
    this.url = url;
    this.usage = usage;
    this.updateInterval = updateInterval;
    this.useHeadRequest = useHeadRequest;
    this.parserPlugin = parserPlugin;
    this.autoGenerateUserVariables = autoGenerateUserVariables;
    this.userVariableAccess = userVariableAccess;
  }

  getAddDataFeedToBSDMAction() {
    const action = dmAddDataFeed(this.name, this.url, this.usage, this.updateInterval, this.useHeadRequest,
      this.parserPlugin, this.autoGenerateUserVariables, this.userVariableAccess);
    return action;
  }
}
