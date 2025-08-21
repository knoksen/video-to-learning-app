/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */

export const parseJSON = (str: string) => {
  const start = str.indexOf('{');
  const end = str.lastIndexOf('}') + 1;
  return JSON.parse(str.substring(start, end));
};

export const parseHTML = (str: string, opener: string, closer: string) => {
  // Use a regex to find the content within ```html ... ``` or ``` ... ```
  const regex = new RegExp(`${opener}(?:html)?\\s*([\\s\\S]*?)\\s*${closer}`);
  const match = str.match(regex);

  // The first capturing group will contain the code.
  if (match && match[1]) {
    // Ensure the extracted code is a full HTML document
    if (match[1].trim().startsWith('<!DOCTYPE html>')) {
      return match[1].trim();
    }
  }

  // Fallback for when the code block is not perfectly formed but contains HTML.
  const fallbackMatch = str.indexOf('<!DOCTYPE html>');
  if (fallbackMatch !== -1) {
    // This is a last resort and might grab extra text at the end.
    return str.substring(fallbackMatch);
  }

  // If no HTML is found, throw an error.
  throw new Error('Could not find a valid HTML code block in the response.');
};
