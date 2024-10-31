import { ukUA } from '@mui/x-data-grid-pro/locales';
// @ts-expect-error
import { enUS } from '@mui/x-data-grid-pro';
// import type { Expect, Equal } from 'test/utils/typeUtils';
import type { Localization } from '@mui/x-data-grid/internals';

export type Expect<T extends true> = T;

export type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;

type Tests = [Expect<Equal<typeof ukUA, Localization>>];
