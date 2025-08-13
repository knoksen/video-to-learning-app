/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */

import Editor from '@monaco-editor/react';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import {Tab, TabList, TabPanel, Tabs} from 'react-tabs';

import {parseHTML, parseJSON} from '@/lib/parse';
import {
  CODE_REGION_CLOSER,
  CODE_REGION_OPENER,
  SPEC_ADDENDUM,
  SPEC_FROM_VIDEO_PROMPT,
} from '@/lib/prompts';
import {generateText} from '@/lib/textGeneration';

const SkeletonLoader = ({message}: {message: string}) => (
  <div className="skeleton-loader">
    <div className="skeleton-tabs">
      <div className="skeleton-tab active"></div>
      <div className="skeleton-tab"></div>
      <div className="skeleton-tab"></div>
    </div>
    <div className="skeleton-content">
      <div className="shimmer"></div>
    </div>
    <p className="skeleton-message">{message}</p>
  </div>
);

const ErrorIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="48px"
    viewBox="0 -960 960 960"
    width="48px"
    fill="currentColor">
    <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
  </svg>
);

const ErrorState = ({
  title,
  message,
  details,
}: {
  title: string;
  message: string;
  details?: string;
}) => (
  <div className="error-state">
    <div className="error-icon-container">
      <ErrorIcon />
    </div>
    <h3 className="error-title">{title}</h3>
    <p className="error-message">{message}</p>
    {details && <p className="error-details">{details}</p>}
  </div>
);
interface ContentContainerProps {
  contentBasis: string;
  preSeededSpec?: string;
  preSeededCode?: string;
  onLoadingStateChange?: (isLoading: boolean) => void;
}

type LoadingState = 'loading-spec' | 'loading-code' | 'ready' | 'error';

// Export the ContentContainer component as a forwardRef component
export default forwardRef(function ContentContainer(
  {
    contentBasis,
    preSeededSpec,
    preSeededCode,
    onLoadingStateChange,
  }: ContentContainerProps,
  ref,
) {
  const [spec, setSpec] = useState<string>(preSeededSpec || '');
  const [code, setCode] = useState<string>(preSeededCode || '');
  const [iframeKey, setIframeKey] = useState(0);
  const [saveMessage, setSaveMessage] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>(
    preSeededSpec && preSeededCode ? 'ready' : 'loading-spec',
  );
  const [error, setError] = useState<string | null>(null);
  const [isEditingSpec, setIsEditingSpec] = useState(false);
  const [editedSpec, setEditedSpec] = useState('');
  const [activeTabIndex, setActiveTabIndex] = useState(0); // 0: Render, 1: Code, 2: Spec

  // Expose methods to the parent component through ref
  useImperativeHandle(ref, () => ({
    getSpec: () => spec,
    getCode: () => code,
  }));

  // Helper function to generate content spec from video
  const generateSpecFromVideo = async (videoUrl: string): Promise<string> => {
    const specResponse = await generateText({
      modelName: 'gemini-2.5-flash',
      prompt: SPEC_FROM_VIDEO_PROMPT,
      videoUrl: videoUrl,
    });

    let spec = parseJSON(specResponse).spec;

    spec += SPEC_ADDENDUM;

    return spec;
  };

  // Helper function to generate code from content spec
  const generateCodeFromSpec = async (spec: string): Promise<string> => {
    const codeResponse = await generateText({
      modelName: 'gemini-2.5-flash',
      prompt: spec,
    });

    const code = parseHTML(
      codeResponse,
      CODE_REGION_OPENER,
      CODE_REGION_CLOSER,
    );
    return code;
  };

  // Propagate loading state changes as a boolean
  useEffect(() => {
    if (onLoadingStateChange) {
      const isLoading =
        loadingState === 'loading-spec' || loadingState === 'loading-code';
      onLoadingStateChange(isLoading);
    }
  }, [loadingState, onLoadingStateChange]);

  // On mount (or when contentBasis changes), generate a content spec and then use that spec to generate code
  useEffect(() => {
    async function generateContent() {
      // If we have pre-seeded content, skip generation
      if (preSeededSpec && preSeededCode) {
        setSpec(preSeededSpec);
        setCode(preSeededCode);
        setLoadingState('ready');
        return;
      }

      try {
        // Reset states
        setLoadingState('loading-spec');
        setError(null);
        setSpec('');
        setCode('');

        // Generate a content spec based on video content
        const generatedSpec = await generateSpecFromVideo(contentBasis);
        setSpec(generatedSpec);
        setLoadingState('loading-code');

        // Generate code using the generated content spec
        const generatedCode = await generateCodeFromSpec(generatedSpec);
        setCode(generatedCode);
        setLoadingState('ready');
      } catch (err) {
        console.error(
          'An error occurred while attempting to generate content:',
          err,
        );
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred',
        );
        setLoadingState('error');
      }
    }

    generateContent();
  }, [contentBasis, preSeededSpec, preSeededCode]);

  // Re-render iframe when code changes
  useEffect(() => {
    if (code) {
      setIframeKey((prev) => prev + 1);
    }
  }, [code]);

  // Show save message when code changes manually (not during initial load)
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => {
        setSaveMessage('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  const handleCodeChange = (value: string | undefined) => {
    setCode(value || '');
    setSaveMessage('HTML updated. Changes will appear in the Render tab.');
  };

  const handleSpecEdit = () => {
    setEditedSpec(spec);
    setIsEditingSpec(true);
  };

  const handleSpecSave = async () => {
    const trimmedEditedSpec = editedSpec.trim();

    // Only regenerate if the spec has actually changed
    if (trimmedEditedSpec === spec) {
      setIsEditingSpec(false); // Close the editor
      setEditedSpec(''); // Reset edited spec state
      return;
    }

    try {
      setLoadingState('loading-code');
      setError(null);
      setSpec(trimmedEditedSpec); // Update spec state with trimmed version
      setIsEditingSpec(false);
      setActiveTabIndex(1); // Switch to code tab

      // Generate code using the edited content spec
      const generatedCode = await generateCodeFromSpec(trimmedEditedSpec);
      setCode(generatedCode);
      setLoadingState('ready');
    } catch (err) {
      console.error(
        'An error occurred while attempting to generate code:',
        err,
      );
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred',
      );
      setLoadingState('error');
    }
  };

  const handleSpecCancel = () => {
    setIsEditingSpec(false);
    setEditedSpec('');
  };

  const renderLoadingState = () => (
    <SkeletonLoader
      message={
        loadingState === 'loading-spec'
          ? 'Generating content spec from video...'
          : 'Generating code from content spec...'
      }
    />
  );

  const renderErrorState = () => (
    <ErrorState
      title="Error Generating Content"
      message={error || 'Something went wrong.'}
      details={
        !contentBasis.startsWith('http://') &&
        !contentBasis.startsWith('https://')
          ? 'URL must begin with http:// or https://'
          : undefined
      }
    />
  );

  const renderSpecContent = () => {
    if (loadingState === 'error') {
      return spec ? (
        <div className="spec-text">{spec}</div>
      ) : (
        renderErrorState()
      );
    }

    if (loadingState === 'loading-spec') {
      return renderLoadingState();
    }

    if (isEditingSpec) {
      return (
        <div className="spec-editor-wrapper">
          <Editor
            height="100%"
            defaultLanguage="text"
            value={editedSpec}
            onChange={(value) => setEditedSpec(value || '')}
            theme="light"
            options={{
              minimap: {enabled: false},
              fontSize: 14,
              wordWrap: 'on',
              lineNumbers: 'off',
            }}
          />
          <div className="spec-button-container">
            <button onClick={handleSpecSave} className="button-primary">
              Save & regenerate code
            </button>
            <button onClick={handleSpecCancel} className="button-secondary">
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="spec-content-wrapper">
        <div className="spec-text">{spec}</div>
        <div className="spec-button-container">
          <button onClick={handleSpecEdit} className="button-primary edit-spec-button">
            Edit <span className="edit-spec-icon">edit</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="content-container-wrapper">
      <Tabs
        selectedIndex={activeTabIndex}
        onSelect={(index) => {
          // If currently editing spec and switching away from spec tab
          if (isEditingSpec && index !== 2) {
            setIsEditingSpec(false); // Exit edit mode
            setEditedSpec(''); // Clear edited content
          }
          setActiveTabIndex(index); // Update the active tab index
        }}>
        <TabList>
          <Tab>Render</Tab>
          <Tab>Code</Tab>
          <Tab>Spec</Tab>
        </TabList>

        <TabPanel>
          {loadingState === 'error' ? (
            renderErrorState()
          ) : loadingState !== 'ready' ? (
            renderLoadingState()
          ) : (
            <div className="render-iframe-wrapper">
              <iframe
                key={iframeKey}
                srcDoc={code}
                className="render-iframe"
                title="rendered-html"
                sandbox="allow-scripts"
              />
            </div>
          )}
        </TabPanel>

        <TabPanel>
          {loadingState === 'error' ? (
            renderErrorState()
          ) : loadingState !== 'ready' ? (
            renderLoadingState()
          ) : (
            <div className="code-editor-wrapper">
              <Editor
                height="100%"
                defaultLanguage="html"
                value={code}
                onChange={handleCodeChange}
                theme="vs-dark"
                options={{
                  minimap: {enabled: false},
                  fontSize: 14,
                  wordWrap: 'on',
                  formatOnPaste: true,
                  formatOnType: true,
                }}
              />
              {saveMessage && <div className="save-message">{saveMessage}</div>}
            </div>
          )}
        </TabPanel>

        <TabPanel>{renderSpecContent()}</TabPanel>
      </Tabs>
    </div>
  );
});
