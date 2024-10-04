export enum MessageEventNameEnum {
  TAB_CREATED = 'tabCreated',
  TAB_REPLACED = 'tabReplaced',
  TAB_UPDATED = 'tabUpdated',
  TAB_ACTIVATED = 'tabActivated',
  SEND_MEDIA = 'sendMedia',
  GET_TAB_INFO = 'getTabInfo',
}

export type EventMsg = {
  eventName: MessageEventNameEnum;
  data: any;
}
