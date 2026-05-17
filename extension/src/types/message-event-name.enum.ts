export enum MessageEventNameEnum {
  TAB_CREATED = 'tabCreated',
  TAB_REPLACED = 'tabReplaced',
  TAB_UPDATED = 'tabUpdated',
  TAB_ACTIVATED = 'tabActivated',
  SEND_MEDIA = 'sendMedia',
  QUICK_SEND_MEDIA_FOR_DOWNLOAD = 'quickSendMediaForDownload',
  GET_TAB_INFO = 'getTabInfo',
  THEME_CHANGED = 'themeChanged',
}

export type EventMsg = {
  eventName: MessageEventNameEnum;
  data: any;
}
