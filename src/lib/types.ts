/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */

export type ContentBasis = {url: string} | {data: string; mimeType: string};

export interface Example {
  title: string;
  url: string;
  spec: string;
  code: string;
}
