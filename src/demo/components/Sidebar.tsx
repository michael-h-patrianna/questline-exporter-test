import { ExtractedAssets } from '@lib';
import React from 'react';

type ComponentVisibilityType = {
  background: boolean;
  header: boolean;
  quests: boolean;
  rewards: boolean;
  timer: boolean;
  button: boolean;
};

interface SidebarProps {
  extractedAssets: ExtractedAssets | null;
  isLoading: boolean;
  error: string | null;
  questlineWidth: number;
  questlineHeight: number;
  componentVisibility: ComponentVisibilityType;
  showQuestKeys: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onQuestlineWidthChange: (width: number) => void;
  onQuestlineHeightChange: (height: number) => void;
  onToggleComponentVisibility: (component: keyof ComponentVisibilityType) => void;
  onToggleShowQuestKeys: (show: boolean) => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  extractedAssets,
  isLoading,
  error,
  questlineWidth,
  questlineHeight,
  componentVisibility,
  showQuestKeys,
  onFileUpload,
  onQuestlineWidthChange,
  onQuestlineHeightChange,
  onToggleComponentVisibility,
  onToggleShowQuestKeys,
  className,
}) => {
  return (
    <aside className={`app-sidebar${className ? ` ${className}` : ''}`}>
      {/* File Upload */}
      <div className="upload-section">
        <label className="file-input-label">
          <input
            type="file"
            accept=".zip"
            onChange={onFileUpload}
            className="file-input-hidden"
            disabled={isLoading}
          />
          <span className="file-input-button">{isLoading ? 'Loading...' : 'Choose ZIP File'}</span>
        </label>
        {isLoading && <div className="loading-message">Loading questline theme...</div>}
        {error && <div className="error-message">{error}</div>}
      </div>

      {extractedAssets && (
        <>
          {/* Controls */}
          <div className="controls-section">
            <h3>Questline Settings</h3>
            <div className="control-group">
              <label>
                Questline Width: {questlineWidth}px
                <input
                  type="range"
                  min="200"
                  max="414"
                  value={questlineWidth}
                  onChange={(e) => onQuestlineWidthChange(Number(e.target.value))}
                />
              </label>
            </div>
            <div className="control-group">
              <label>
                Questline Height: {questlineHeight}px
                <input
                  type="range"
                  min="400"
                  max="900"
                  value={questlineHeight}
                  onChange={(e) => onQuestlineHeightChange(Number(e.target.value))}
                />
              </label>
            </div>
            <div className="control-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={showQuestKeys}
                  onChange={(e) => onToggleShowQuestKeys(e.target.checked)}
                  className="toggle-checkbox"
                />
                <span className="toggle-text">Show Quest Keys</span>
              </label>
            </div>
          </div>

          {/* Information panel */}
          <div className="info-section">
            <h3>Questline Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <strong>ID:</strong> {extractedAssets.questlineData.questlineId}
              </div>
              <div className="info-item">
                <strong>Frame Size:</strong> {extractedAssets.questlineData.frameSize.width} ×{' '}
                {extractedAssets.questlineData.frameSize.height}
              </div>
              <div className="info-item">
                <strong>Total Quests:</strong> {extractedAssets.questlineData.metadata.totalQuests}
              </div>
              <div className="info-item">
                <strong>Version:</strong> {extractedAssets.questlineData.metadata.version}
              </div>
            </div>

            <h4>Components Included:</h4>
            <div className="components-list">
              <button
                className={`component-toggle ${extractedAssets.backgroundImage ? 'component-present' : 'component-missing'} ${!componentVisibility.background ? 'component-hidden' : ''}`}
                onClick={() => onToggleComponentVisibility('background')}
                disabled={!extractedAssets.backgroundImage}
              >
                Background{' '}
                {extractedAssets.backgroundImage
                  ? componentVisibility.background
                    ? '👁'
                    : '👁‍🗨'
                  : '✗'}
              </button>
              <button
                className={`component-toggle ${extractedAssets.headerImages ? 'component-present' : 'component-missing'} ${!componentVisibility.header ? 'component-hidden' : ''}`}
                onClick={() => onToggleComponentVisibility('header')}
                disabled={!extractedAssets.headerImages}
              >
                Header{' '}
                {extractedAssets.headerImages
                  ? componentVisibility.header
                    ? '👁'
                    : '👁‍🗨'
                  : '✗'}
              </button>
              <button
                className={`component-toggle ${extractedAssets.questlineData.quests.length > 0 ? 'component-present' : 'component-missing'} ${!componentVisibility.quests ? 'component-hidden' : ''}`}
                onClick={() => onToggleComponentVisibility('quests')}
                disabled={extractedAssets.questlineData.quests.length === 0}
              >
                Quests ({extractedAssets.questlineData.quests.length}){' '}
                {extractedAssets.questlineData.quests.length > 0
                  ? componentVisibility.quests
                    ? '👁'
                    : '👁‍🗨'
                  : '✗'}
              </button>
              <button
                className={`component-toggle ${extractedAssets.rewardsImages ? 'component-present' : 'component-missing'} ${!componentVisibility.rewards ? 'component-hidden' : ''}`}
                onClick={() => onToggleComponentVisibility('rewards')}
                disabled={!extractedAssets.rewardsImages}
              >
                Rewards{' '}
                {extractedAssets.rewardsImages
                  ? componentVisibility.rewards
                    ? '👁'
                    : '👁‍🗨'
                  : '✗'}
              </button>
              <button
                className={`component-toggle ${extractedAssets.questlineData.timer ? 'component-present' : 'component-missing'} ${!componentVisibility.timer ? 'component-hidden' : ''}`}
                onClick={() => onToggleComponentVisibility('timer')}
                disabled={!extractedAssets.questlineData.timer}
              >
                Timer{' '}
                {extractedAssets.questlineData.timer
                  ? componentVisibility.timer
                    ? '👁'
                    : '👁‍🗨'
                  : '✗'}
              </button>
              <button
                className={`component-toggle ${extractedAssets.questlineData.button ? 'component-present' : 'component-missing'} ${!componentVisibility.button ? 'component-hidden' : ''}`}
                onClick={() => onToggleComponentVisibility('button')}
                disabled={!extractedAssets.questlineData.button}
              >
                Button{' '}
                {extractedAssets.questlineData.button
                  ? componentVisibility.button
                    ? '👁'
                    : '👁‍🗨'
                  : '✗'}
              </button>
            </div>

            <p className="interaction-help">
              <strong>Interaction Guide:</strong>
              <br />
              • Click quests to cycle through states
              <br />
              • Click header to cycle: active → success → fail
              <br />
              • Click rewards to cycle through states
              <br />
              • Click button to change states
              <br />• Adjust questline dimensions using the sliders above
            </p>
          </div>
        </>
      )}
    </aside>
  );
};
