/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */

import {DataContext} from '@/context';
import {Example} from '@/lib/types';
import {useContext, useEffect, useState} from 'react';

interface ExampleGalleryProps {
  title?: string;
  selectedExample: Example | null;
  onSelectExample: (example: Example) => void;
}

export default function ExampleGallery({
  title = 'Examples',
  selectedExample,
  onSelectExample,
}: ExampleGalleryProps) {
  const getThumbnailUrl = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
  };

  const {defaultExample, examples, isLoading} = useContext(DataContext);

  return (
    <div className="example-gallery">
      <h2 className="gallery-title">{title}</h2>
      {isLoading ? (
        <div className="gallery-grid-loading">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="gallery-item-skeleton">
              <div className="thumbnail-skeleton"></div>
              <div className="title-skeleton"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="gallery-grid">
          {examples.map((example) => (
            <div
              key={example.title}
              className={`gallery-item ${
                selectedExample?.url === example.url ? 'selected' : ''
              }`}
              onClick={() => onSelectExample(example)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectExample(example);
                }
              }}
              tabIndex={0}
              role="button"
              aria-pressed={selectedExample?.url === example.url}
              aria-label={`Select example: ${example.title}`}>
              <div className="thumbnail-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getThumbnailUrl(example.url)}
                  alt={example.title}
                  className="thumbnail"
                  loading="lazy"
                />
              </div>
              <div className="gallery-item-title">{example.title}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
