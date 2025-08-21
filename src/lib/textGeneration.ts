/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */

import {
  FinishReason,
  GenerateContentConfig,
  GoogleGenAI,
  Part,
} from '@google/genai';
import {ContentBasis} from './types';

interface GenerateTextOptions {
  modelName: string;
  prompt: string;
  video?: ContentBasis;
  temperature?: number;
}

/**
 * Generate text content using the Gemini API, optionally including video data.
 *
 * @param options - Configuration options for the generation request.
 * @returns The response from the Gemini API.
 */
export async function generateText(
  options: GenerateTextOptions,
): Promise<string> {
  const {modelName, prompt, video, temperature = 0.75} = options;

  if (!process.env.API_KEY) {
    throw new Error(
      'Gemini API key is missing or empty. Please set the API_KEY environment variable.',
    );
  }

  const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

  let contents: string | {parts: Part[]};

  if (video) {
    const parts: Part[] = [{text: prompt}];
    if ('url' in video) {
      parts.push({
        fileData: {
          mimeType: 'video/mp4',
          fileUri: video.url,
        },
      });
    } else if ('data' in video) {
      parts.push({
        inlineData: {
          data: video.data,
          mimeType: video.mimeType,
        },
      });
    }
    contents = {parts};
  } else {
    contents = prompt;
  }

  const generationConfig: GenerateContentConfig = {
    temperature,
  };

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: generationConfig,
    });

    // Check for prompt blockage
    if (response.promptFeedback?.blockReason) {
      throw new Error(
        `Content generation failed: Prompt blocked (reason: ${response.promptFeedback.blockReason})`,
      );
    }

    // Check for response blockage
    if (!response.candidates || response.candidates.length === 0) {
      throw new Error('Content generation failed: No candidates returned.');
    }

    const firstCandidate = response.candidates[0];

    // Check for finish reasons other than STOP
    if (
      firstCandidate.finishReason &&
      firstCandidate.finishReason !== FinishReason.STOP
    ) {
      if (firstCandidate.finishReason === FinishReason.SAFETY) {
        throw new Error(
          'Content generation failed: Response blocked due to safety settings.',
        );
      } else {
        throw new Error(
          `Content generation failed: Stopped due to ${firstCandidate.finishReason}.`,
        );
      }
    }

    if (!response.text) {
      console.warn('Gemini response was empty. Full response:', response);
      throw new Error(
        'Content generation failed: Received an empty response from the model.',
      );
    }

    return response.text;
  } catch (error) {
    console.error(
      'An error occurred during Gemini API call or response processing:',
      error,
    );
    throw error;
  }
}
