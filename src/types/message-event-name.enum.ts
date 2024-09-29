export enum MessageEventNameEnum {
  TAB_CREATED = 'tabCreated',
  TAB_REPLACED = 'tabReplaced',
  TAB_UPDATED = 'tabUpdated',
  TAB_ACTIVATED = 'tabActivated',
  SEND_MEDIA = 'sendMedia',
}

export type EventMsg = {
  eventName: MessageEventNameEnum;
  data: any;
}
