import {NullableString} from './common.type';
import {MixedObject} from './mixed-object.type';

export type Children = HTMLElement | HTMLElement[];

export type Props = {
  class?: string[] | string;
  html?: NullableString;
  type?: NullableString;
  title?: NullableString;
  href?: NullableString;
  alt?: NullableString;
  src?: NullableString;
  data?: MixedObject;
  attributes?: MixedObject;
}
