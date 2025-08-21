/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */

import ContentContainer from '@/components/ContentContainer';
import ExampleGallery from '@/components/ExampleGallery';
import {DataContext} from '@/context';
import type {ContentBasis, Example} from '@/lib/types';
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

const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="20px"
    viewBox="0 -960 960 960"
    width="20px"
    fill="currentColor">
    <path d="M440-320v-320H160l320-320 320 320H520v320h-80ZM160-120q-33 0-56.5-23.5T80-200v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-120H160Z" />
  </svg>
);

const CameraIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="20px"
    viewBox="0 -960 960 960"
    width="20px"
    fill="currentColor">
    <path d="M480-240q-100 0-170-70t-70-170q0-100 70-170t170-70q100 0 170 70t70 170q0 100-70 170t-170 70Zm0-80q67 0 113.5-46.5T640-480q0-67-46.5-113.5T480-640q-67 0-113.5 46.5T320-480q0 67 46.5 113.5T480-320Zm0 240q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
  </svg>
);

type VideoSource = {
  url: string;
  type: 'youtube' | 'local' | 'none';
  title: string;
};

// Helper function to load a shared state by ID
export default function App() {
  const {defaultExample, examples} = useContext(DataContext);
  const [inputValue, setInputValue] = useState('');

  const [videoSource, setVideoSource] = useState<VideoSource>({
    url: '',
    type: 'none',
    title: '',
  });
  const [contentBasis, setContentBasis] = useState<ContentBasis | null>(null);

  const [urlValidating, setUrlValidating] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const contentContainerRef = useRef<{
    getSpec: () => string;
    getCode: () => string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
          setVideoSource({
            url: sharedData.videoUrl,
            type: 'youtube',
            title: 'Shared Content',
          });
          setContentBasis({url: sharedData.videoUrl});
          setSelectedExample({
            title: 'Shared Content',
            url: sharedData.videoUrl,
            spec: sharedData.spec,
            code: sharedData.code,
          });
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
  }, [defaultExample]);

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
    setVideoSource({url: example.url, type: 'youtube', title: example.title});
    setContentBasis({url: example.url});
    setSelectedExample(example);
  };

  const handleShare = async () => {
    if (videoSource.type !== 'youtube') {
      setNotification({
        message: 'Sharing is only available for apps generated from YouTube videos.',
        type: 'error',
      });
      return;
    }

    if (!contentContainerRef.current) return;
    const spec = contentContainerRef.current.getSpec();
    const code = contentContainerRef.current.getCode();

    if (!videoSource.url || !spec || !code) {
      setNotification({
        message: 'Cannot share. Please generate an app first.',
        type: 'error',
      });
      return;
    }

    const shareData = {
      videoUrl: videoSource.url,
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
    setVideoSource({url: '', type: 'none', title: ''});
    setContentBasis(null);
    setSelectedExample(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    inputRef.current?.focus();
  };

  const proceedWithContentBasis = (
    basis: ContentBasis,
    source: VideoSource,
  ) => {
    setContentBasis(basis);
    setVideoSource(source);
    setUrlValidating(false);
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
    setVideoSource({url: '', type: 'none', title: ''});
    setContentBasis(null);
    setContentLoading(false);
    setSelectedExample(null);

    if (VALIDATE_INPUT_URL) {
      const validationResult = await validateYoutubeUrl(trimmedValue);

      if (validationResult.isValid) {
        proceedWithContentBasis(
          {url: trimmedValue},
          {url: trimmedValue, type: 'youtube', title: 'YouTube Video'},
        );
      } else {
        setNotification({
          message: validationResult.error || 'Invalid YouTube URL',
          type: 'error',
        });
        setUrlValidating(false);
      }
    } else {
      proceedWithContentBasis(
        {url: trimmedValue},
        {url: trimmedValue, type: 'youtube', title: 'YouTube Video'},
      );
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isLoading) return;

    setUrlValidating(true); // Re-use this loading state
    setVideoSource({url: '', type: 'none', title: ''});
    setContentBasis(null);
    setSelectedExample(null);
    setInputValue(`local file: ${file.name}`);

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const dataUrl = loadEvent.target?.result as string;
        const [header, data] = dataUrl.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1];
        if (!data || !mimeType) {
          throw new Error('Invalid file format');
        }

        const blobUrl = URL.createObjectURL(file);

        proceedWithContentBasis(
          {data, mimeType},
          {url: blobUrl, type: 'local', title: file.name},
        );
      } catch (error) {
        setNotification({
          message: 'Could not read the selected file.',
          type: 'error',
        });
        setUrlValidating(false);
      }
    };
    reader.onerror = () => {
      setNotification({
        message: 'Error reading file.',
        type: 'error',
      });
      setUrlValidating(false);
    };
    reader.readAsDataURL(file);
  };

  const handleVideoRecorded = (videoAsDataUrl: string) => {
    setShowCamera(false);
    if (isLoading) return;

    setUrlValidating(true);
    setVideoSource({url: '', type: 'none', title: ''});
    setContentBasis(null);
    setSelectedExample(null);
    const title = 'Recorded Video';
    setInputValue(title);

    try {
      const [header, data] = videoAsDataUrl.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1];
      if (!data || !mimeType) {
        throw new Error('Invalid video format');
      }
      proceedWithContentBasis({data, mimeType}, {url: videoAsDataUrl, type: 'local', title});
    } catch (error) {
      setNotification({
        message: 'Could not process the recorded video.',
        type: 'error',
      });
      setUrlValidating(false);
    }
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
              Instantly turn any video into a fun, interactive learning app using AI.
            </p>
            <p className="attribution">
              An experiment by <strong>Aaron Wade</strong>
            </p>
            <div className="input-container">
              <label htmlFor="youtube-url" className="input-label">
                Paste a YouTube URL or select another source:
                {selectedExample && (
                  <span className="selected-example-indicator">
                    Using example: &quot;{selectedExample.title}&quot;
                  </span>
                )}
                 {videoSource.type === 'local' && (
                  <span className="selected-example-indicator">
                    Using local video: &quot;{videoSource.title}&quot;
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
                  ? 'Processing...'
                  : contentLoading
                  ? 'Generating...'
                  : 'Generate from URL'}
              </button>
              <div className="button-group-secondary">
                 <button
                  onClick={() => fileInputRef.current?.click()}
                  className="button-secondary"
                  disabled={isLoading}
                  title="Upload a video file"
                  aria-label="Upload a video file">
                  <UploadIcon />
                  <span className="button-text">Upload Video</span>
                </button>
                 <button
                  onClick={() => setShowCamera(true)}
                  className="button-secondary"
                  disabled={isLoading}
                   title="Record video from camera"
                  aria-label="Record video from camera">
                  <CameraIcon />
                  <span className="button-text">Use Camera</span>
                </button>
                <button
                  onClick={handleShare}
                  className="button-secondary share-button"
                  disabled={
                    videoSource.type !== 'youtube' ||
                    isLoading ||
                    !contentContainerRef.current?.getCode()
                  }
                  title={videoSource.type !== 'youtube' ? "Sharing only available for YouTube videos" : "Share this generated app"}
                  aria-label="Share this generated app">
                  <ShareIcon />
                  <span className="button-text">Share</span>
                </button>
              </div>
               <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="video/*"
                style={{display: 'none'}}
              />
            </div>

            <div className="video-container">
              {videoSource.type === 'youtube' ? (
                <iframe
                  className="video-iframe"
                  src={getYoutubeEmbedUrl(videoSource.url)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen></iframe>
              ) : videoSource.type === 'local' ? (
                <video src={videoSource.url} controls className="video-iframe"></video>
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
              {contentBasis ? (
                <ContentContainer
                  key={videoSource.url}
                  contentBasis={contentBasis}
                  onLoadingStateChange={handleContentLoadingStateChange}
                  preSeededSpec={selectedExample?.spec}
                  preSeededCode={selectedExample?.code}
                  ref={contentContainerRef}
                />
              ) : (
                <div className="content-placeholder">
                  <p>
                    {urlValidating
                      ? 'Validating source...'
                      : 'Provide a video source or select an example to begin'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="gallery-container">
          <ExampleGallery
            title={PRESEED_CONTENT ? 'More examples' : 'Or try one of these'}
            onSelectExample={handleExampleSelect}
            selectedExample={selectedExample}
          />
        </div>
      </main>

      {showCamera && (
        <CameraRecorder
          onClose={() => setShowCamera(false)}
          onVideoReady={handleVideoRecorded}
        />
      )}

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.type === 'success' ? <SuccessIcon /> : <NotifyErrorIcon />}
          {notification.message}
        </div>
      )}
    </>
  );
}

// Camera Recorder Component
function CameraRecorder({
  onClose,
  onVideoReady,
}: {
  onClose: () => void;
  onVideoReady: (dataUrl: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        alert('Could not access camera. Please check permissions.');
        onClose();
      }
    }
    if (!videoUrl) {
      setupCamera();
    }

    return () => {
      // Cleanup: stop camera stream
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onClose, videoUrl]);

  const handleStartRecording = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunks, {type: 'video/webm'});
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
      };
      setRecordedChunks([]);
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleUseVideo = () => {
     if (!videoUrl) return;
      fetch(videoUrl)
        .then(res => res.blob())
        .then(blob => {
           const reader = new FileReader();
           reader.onloadend = () => {
             onVideoReady(reader.result as string);
           };
           reader.readAsDataURL(blob);
        });
  };

  const handleRetake = () => {
    setVideoUrl(null);
    setRecordedChunks([]);
  };

  return (
    <div className="camera-modal-overlay" onClick={onClose}>
      <div className="camera-modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{videoUrl ? 'Preview Recording' : 'Record Video'}</h3>
        <video ref={videoRef} autoPlay muted={!videoUrl} controls={!!videoUrl} src={videoUrl || undefined}></video>
        <div className="camera-modal-controls">
          {!videoUrl ? (
            <>
              {!isRecording ? (
                <button onClick={handleStartRecording} className="button-primary">Start Recording</button>
              ) : (
                <button onClick={handleStopRecording} className="button-primary">Stop Recording</button>
              )}
            </>
          ) : (
            <>
              <button onClick={handleUseVideo} className="button-primary">Use this video</button>
              <button onClick={handleRetake} className="button-secondary">Retake</button>
            </>
          )}
           <button onClick={onClose} className="button-secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
}
