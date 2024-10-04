export type TabData = {
  uuid: string;
  id: number;
  favIconUrl: string;
  url: string;
  title: string;
  isRestricted: boolean;
}

export type TabExpanded = {
  [key: string]: boolean; // Where the key is the tabUuid
}

export type TabInfo = {
  [key: string]: TabData; // Where the key is the tabUuid
}
