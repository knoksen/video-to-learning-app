/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */

import ContentContainer from '@/components/ContentContainer';
import ExampleGallery from '@/components/ExampleGallery';
import {DataContext} from '@/context';
import {Example} from '@/lib/types';
import {getYoutubeEmbedUrl, validateYoutubeUrl} from '@/lib/youtube';
import {useContext, useEffect, useRef, useState} from 'react';

// Whether to validate the input URL before attempting to generate content
const VALIDATE_INPUT_URL = true;

// Whether to pre-seed with example content
const PRESEED_CONTENT = false;

const GenerateIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="20px"
    viewBox="0 -960 960 960"
    width="20px"
    fill="currentColor">
    <path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 128.5 27.5T720-690v-110h80v280H520v-80h168q-39-61-99.5-98.5T480-740q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z" />
  </svg>
);

const ShareIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="20px"
    viewBox="0 -960 960 960"
    width="20px"
    fill="currentColor">
    <path d="M720-80q-50 0-85-35t-35-85q0-7 1-14.5t3-13.5L322-392q-17 15-38 23.5t-44 8.5q-50 0-85-35t-35-85q0-50 35-85t85-35q23 0 44 8.5t38 23.5l282-164q-2-6-3-13.5t-1-14.5q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35q-23 0-44-8.5T638-672L356-508q2 6 3 13.5t1 14.5q0 7-1 14.5t-3 13.5l282 164q17-15 38-23.5t44-8.5q50 0 85 35t35 85q0 50-35 85t-85 35Zm0-640q17 0 28.5-11.5T760-760q0-17-11.5-28.5T720-800q-17 0-28.5 11.5T680-760q0 17 11.5 28.5T720-720ZM240-440q17 0 28.5-11.5T280-480q0-17-11.5-28.5T240-520q-17 0-28.5 11.5T200-480q0 17 11.5 28.5T240-440Zm480 280q17 0 28.5-11.5T760-200q0-17-11.5-28.5T720-240q-17 0-28.5 11.5T680-200q0 17 11.5 28.5T720-160Z" />
  </svg>
);

const PlayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="48px"
    viewBox="0 -960 960 960"
    width="48px"
    fill="currentColor">
    <path d="M320-200v-560l440 280-440 280Zm80-280Zm0 134 210-134-210-134v268Z" />
  </svg>
);

const SuccessIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    viewBox="0 -960 960 960"
    width="24px"
    fill="currentColor">
    <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
  </svg>
);

const NotifyErrorIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    viewBox="0 -960 960 960"
    width="24px"
    fill="currentColor">
    <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
  </svg>
);

const ClearIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="20px"
    viewBox="0 -960 960 960"
    width="20px"
    fill="currentColor">
    <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
  </svg>
);

// Helper function to load a shared state by ID
export default function App() {
  const {defaultExample, examples} = useContext(DataContext);
  const [inputValue, setInputValue] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [urlValidating, setUrlValidating] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const contentContainerRef = useRef<{
    getSpec: () => string;
    getCode: () => string;
  } | null>(null);

  const [reloadCounter, setReloadCounter] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedExample, setSelectedExample] = useState<Example | null>(null);

  const isLoading = urlValidating || contentLoading;

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    // This effect runs only once on mount to check for a shared link.
    const hash = window.location.hash;
    if (hash.startsWith('#s=')) {
      const encodedData = hash.substring(3);
      try {
        const decodedData = atob(encodedData);
        const sharedData = JSON.parse(decodedData);
        if (sharedData.videoUrl && sharedData.spec && sharedData.code) {
          setInputValue(sharedData.videoUrl);
          setVideoUrl(sharedData.videoUrl);
          setSelectedExample({
            title: 'Shared Content',
            url: sharedData.videoUrl,
            spec: sharedData.spec,
            code: sharedData.code,
          });
          setReloadCounter((c) => c + 1);
        }
      } catch (error) {
        console.error('Failed to parse shared content from URL:', error);
        setNotification({
          message: 'Could not load shared content. The link may be corrupted.',
          type: 'error',
        });
        window.location.hash = '';
      }
    } else if (PRESEED_CONTENT && defaultExample) {
      handleExampleSelect(defaultExample);
    }
  }, [defaultExample]); // Dependency on defaultExample is needed for pre-seeding

  // When user types in the input, deselect any active example
  useEffect(() => {
    if (selectedExample && inputValue !== selectedExample.url) {
      setSelectedExample(null);
    }
  }, [inputValue, selectedExample]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit();
    }
  };

  const handleExampleSelect = (example: Example) => {
    setInputValue(example.url);
    setVideoUrl(example.url);
    setSelectedExample(example);
    setReloadCounter((c) => c + 1);
  };

  const handleShare = async () => {
    if (!contentContainerRef.current) {
      return;
    }
    const spec = contentContainerRef.current.getSpec();
    const code = contentContainerRef.current.getCode();

    if (!videoUrl || !spec || !code) {
      setNotification({
        message: 'Cannot share. Please generate an app first.',
        type: 'error',
      });
      return;
    }

    const shareData = {
      videoUrl,
      spec,
      code,
    };

    const encodedData = btoa(JSON.stringify(shareData));
    const shareUrl = `${window.location.origin}${window.location.pathname}#s=${encodedData}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setNotification({
        message: 'Link copied to clipboard!',
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to copy share link:', err);
      setNotification({
        message: 'Failed to copy link to clipboard.',
        type: 'error',
      });
    }
  };

  const handleClear = () => {
    setInputValue('');
    setVideoUrl('');
    setSelectedExample(null);
    inputRef.current?.focus();
  };

  const handleSubmit = async () => {
    const trimmedValue = inputValue.trim();

    if (!trimmedValue) {
      inputRef.current?.focus();
      return;
    }
    if (isLoading) return;

    // Check if the input URL matches a known example
    const matchedExample = examples.find((ex) => ex.url === trimmedValue);
    if (matchedExample) {
      handleExampleSelect(matchedExample);
      return;
    }

    // If not an example, proceed with validation and generation
    setUrlValidating(true);
    setVideoUrl('');
    setContentLoading(false);
    setSelectedExample(null);

    if (VALIDATE_INPUT_URL) {
      const validationResult = await validateYoutubeUrl(trimmedValue);

      if (validationResult.isValid) {
        proceedWithVideo(trimmedValue);
      } else {
        setNotification({
          message: validationResult.error || 'Invalid YouTube URL',
          type: 'error',
        });
        setUrlValidating(false);
      }
    } else {
      proceedWithVideo(trimmedValue);
    }
  };

  const proceedWithVideo = (url: string) => {
    setVideoUrl(url);
    setReloadCounter((c) => c + 1);
    setUrlValidating(false);
  };

  const handleContentLoadingStateChange = (isLoading: boolean) => {
    setContentLoading(isLoading);
  };

  return (
    <>
      <main className="main-container">
        <div className="main-content">
          <div className="left-side">
            <h1 className="headline">Video to Learning App</h1>
            <p className="subtitle">
              Generate interactive learning apps from YouTube content
            </p>
            <p className="attribution">
              An experiment by <strong>Aaron Wade</strong>
            </p>
            <div className="input-container">
              <label htmlFor="youtube-url" className="input-label">
                Paste a URL from YouTube:
                {selectedExample && (
                  <span className="selected-example-indicator">
                    Using example: &quot;{selectedExample.title}&quot;
                  </span>
                )}
              </label>

              <div className="input-wrapper">
                <input
                  ref={inputRef}
                  id="youtube-url"
                  className="youtube-input"
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={inputValue}
                  disabled={isLoading}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                {inputValue && !isLoading && (
                  <button
                    className="clear-button"
                    onClick={handleClear}
                    title="Clear input"
                    aria-label="Clear input">
                    <ClearIcon />
                  </button>
                )}
              </div>
            </div>

            <div className="button-container">
              <button
                onClick={handleSubmit}
                className="button-primary submit-button"
                disabled={isLoading}>
                {isLoading ? <div className="spinner"></div> : <GenerateIcon />}
                {urlValidating
                  ? 'Validating...'
                  : contentLoading
                  ? 'Generating...'
                  : 'Generate app'}
              </button>
              <button
                onClick={handleShare}
                className="button-secondary share-button"
                disabled={
                  !videoUrl || isLoading || !contentContainerRef.current?.getCode()
                }
                title="Share this generated app"
                aria-label="Share this generated app">
                <ShareIcon />
                <span>Share</span>
              </button>
            </div>

            <div className="video-container">
              {videoUrl ? (
                <iframe
                  className="video-iframe"
                  src={getYoutubeEmbedUrl(videoUrl)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen></iframe>
              ) : (
                <div className="video-placeholder">
                  <PlayIcon />
                  <span>Video will appear here</span>
                </div>
              )}
            </div>
          </div>

          <div className="right-side">
            <div className="content-area">
              {videoUrl ? (
                <ContentContainer
                  key={reloadCounter}
                  contentBasis={videoUrl}
                  onLoadingStateChange={handleContentLoadingStateChange}
                  preSeededSpec={selectedExample?.spec}
                  preSeededCode={selectedExample?.code}
                  ref={contentContainerRef}
                />
              ) : (
                <div className="content-placeholder">
                  <p>
                    {urlValidating
                      ? 'Validating URL...'
                      : 'Paste a YouTube URL or select an example to begin'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="gallery-container">
          <ExampleGallery
            title={PRESEED_CONTENT ? 'More examples' : 'Examples'}
            onSelectExample={handleExampleSelect}
            selectedExample={selectedExample}
          />
        </div>
      </main>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.type === 'success' ? <SuccessIcon /> : <NotifyErrorIcon />}
          {notification.message}
        </div>
      )}
    </>
  );
}