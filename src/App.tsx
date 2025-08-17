import React, { useState } from 'react';
import './App.css';
import { QuestlineViewer } from './components/QuestlineViewer';
import { ExtractedAssets } from './types';
import { extractQuestlineZip } from './utils/zipExtractor';

function App() {
  const [extractedAssets, setExtractedAssets] = useState<ExtractedAssets | null>(null);
  const [questlineWidth, setQuestlineWidth] = useState(800);
  const [questlineHeight, setQuestlineHeight] = useState(600);
  const [showQuestKeys, setShowQuestKeys] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      setIsLoading(true);
      console.log('Starting ZIP extraction for:', file.name);

      const assets = await extractQuestlineZip(file);
      setExtractedAssets(assets);

      // Auto-set questline dimensions to match the original frame size
      const frameWidth = assets.questlineData.frameSize?.width || 800;
      const frameHeight = assets.questlineData.frameSize?.height || 600;
      setQuestlineWidth(frameWidth);
      setQuestlineHeight(frameHeight);

      console.log('Successfully loaded questline:', assets.questlineData.questlineId);
      console.log('Auto-set dimensions to:', frameWidth, 'x', frameHeight);
    } catch (err) {
      console.error('Error extracting ZIP:', err);
      setError(err instanceof Error ? err.message : 'Failed to extract ZIP file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = () => {
    console.log('Button clicked - implement reward claiming logic here');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Questline Demo</h1>
        <p>Upload a ZIP file exported from the latest Figma Questline Plugin</p>
      </header>

      <main className="App-main">
        <div className="upload-section">
          <input
            type="file"
            accept=".zip"
            onChange={handleFileUpload}
            className="file-input"
            disabled={isLoading}
            title="Choose a ZIP file exported from the Figma Questline Plugin"
          />
          {isLoading && <div className="loading-message">Loading questline...</div>}
          {error && <div className="error-message">{error}</div>}
        </div>

        {extractedAssets && (
          <>
            <div className="controls-section">

              <div className="control-row">
                <div className="control-group">
                  <label>
                    Questline Width: {questlineWidth}px
                    <input
                      type="range"
                      min="200"
                      max="1200"
                      value={questlineWidth}
                      onChange={(e) => setQuestlineWidth(Number(e.target.value))}
                    />
                  </label>
                </div>
                <div className="control-group">
                  <label>
                    Questline Height: {questlineHeight}px
                    <input
                      type="range"
                      min="200"
                      max="800"
                      value={questlineHeight}
                      onChange={(e) => setQuestlineHeight(Number(e.target.value))}
                    />
                  </label>
                </div>
              </div>



            </div>

            {/* Main questline viewer */}
            <div className="questline-container">
              {/* Debug info overlay */}

                <div className="debug-overlay">


                              <div className="control-group">
                  <label >
                    <input

                      type="checkbox"
                      checked={showQuestKeys}
                      onChange={(e) => setShowQuestKeys(e.target.checked)}
                    />
                    Show Quest Keys
                  </label>
                </div></div>


              <QuestlineViewer
                questlineData={extractedAssets.questlineData}
                assets={extractedAssets}
                questlineWidth={questlineWidth}
                questlineHeight={questlineHeight}
                showQuestKeys={showQuestKeys}
                onButtonClick={handleButtonClick}
              />
            </div>

            {/* Information panel */}
            <div className="info-section">
              <h3>Questline Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <strong>ID:</strong> {extractedAssets.questlineData.questlineId}
                </div>
                <div className="info-item">
                  <strong>Frame Size:</strong> {extractedAssets.questlineData.frameSize.width} × {extractedAssets.questlineData.frameSize.height}
                </div>
                <div className="info-item">
                  <strong>Total Quests:</strong> {extractedAssets.questlineData.metadata.totalQuests}
                </div>
                <div className="info-item">
                  <strong>Format Version:</strong> {extractedAssets.questlineData.metadata.version}
                </div>
              </div>

              <h4>Components Included:</h4>
              <div className="components-list">
                <span className={extractedAssets.questlineData.timer ? 'component-present' : 'component-missing'}>
                  Timer {extractedAssets.questlineData.timer ? '✓' : '✗'}
                </span>
                <span className={extractedAssets.questlineData.header ? 'component-present' : 'component-missing'}>
                  Header {extractedAssets.questlineData.header ? '✓' : '✗'}
                </span>
                <span className={extractedAssets.questlineData.rewards ? 'component-present' : 'component-missing'}>
                  Rewards {extractedAssets.questlineData.rewards ? '✓' : '✗'}
                </span>
                <span className={extractedAssets.questlineData.button ? 'component-present' : 'component-missing'}>
                  Button {extractedAssets.questlineData.button ? '✓' : '✗'}
                </span>
              </div>

              <p className="interaction-help">
                <strong>Interaction Guide:</strong><br />
                • Click quests to cycle: locked → active → unclaimed → completed<br />
                • Click header to cycle: active → success → fail<br />
                • Click rewards to cycle: active → fail → unclaimed → claimed<br />
                • Hover/click button to see different states
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
