import React, { useState } from 'react';
import { QuestlineViewer } from './components/QuestlineViewer';
import { extractQuestlineZip } from './utils/zipExtractor';
import { ExtractedAssets, QuestState } from './types';
import './App.css';

function App() {
  // Constrain width and height to prevent overflow
  // Account for the questline-container's available space and padding
  const containerPadding = 32; // 16px padding on each side
  const availableWidth = Math.min(1200, window.innerWidth - 100) - containerPadding;
  const availableHeight = Math.min(800, window.innerHeight - 200) - containerPadding;
  const maxWidth = Math.max(200, availableWidth);
  const maxHeight = Math.max(200, availableHeight);
  
  const [extractedAssets, setExtractedAssets] = useState<ExtractedAssets | null>(null);
  const [questStates, setQuestStates] = useState<QuestState>({});
  const [containerWidth, setContainerWidth] = useState(Math.min(800, maxWidth));
  const [containerHeight, setContainerHeight] = useState(Math.min(600, maxHeight));
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      const assets = await extractQuestlineZip(file);
      setExtractedAssets(assets);
      
      // Initialize all quests as closed (not locked)
      const initialStates: QuestState = {};
      assets.questlineData.quests.forEach(quest => {
        initialStates[quest.questKey] = 'active';
      });
      setQuestStates(initialStates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract ZIP file');
    }
  };

  const handleQuestClick = (questKey: string) => {
    if (!extractedAssets) return;
    
    console.log('handleQuestClick called with questKey:', questKey);
    
    setQuestStates(prev => {
      const currentState = prev[questKey] || 'locked';
      let nextState: 'locked' | 'active' | 'unclaimed' | 'completed';
      
      console.log('Current state for', questKey, ':', currentState);
      
      switch (currentState) {
        case 'locked':
          nextState = 'active';
          break;
        case 'active':
          nextState = 'unclaimed';
          break;
        case 'unclaimed':
          nextState = 'completed';
          break;
        case 'completed':
          nextState = 'locked';
          break;
        default:
          nextState = 'locked';
      }
      
      console.log('Next state for', questKey, ':', nextState);
      console.log('Previous states:', prev);
      
      const newStates = { ...prev, [questKey]: nextState };
      console.log('New states:', newStates);
      
      return newStates;
    });
  };

  const handleContainerClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    console.log('Click target:', target);
    console.log('Target tagName:', target.tagName);
    console.log('Target classList:', target.classList);
    console.log('Target parentElement:', target.parentElement);
    
    // Check if the clicked element is a quest item or its child
    let questItem = target.closest('.quest-item');
    console.log('Quest item found via closest:', questItem);
    
    // If not found via closest, check if the target itself is a quest item
    if (!questItem && target.classList.contains('quest-item')) {
      questItem = target;
      console.log('Quest item found via direct class check:', questItem);
    }
    
    // If still not found, check if the target is an img inside a quest item
    if (!questItem && target.tagName === 'IMG') {
      questItem = target.closest('.quest-item');
      console.log('Quest item found via img parent:', questItem);
    }
    
    if (questItem) {
      // Find the quest key from the quest item's key or title
      const questKey = questItem.getAttribute('data-quest-key') || 
                      (questItem as HTMLElement).title?.match(/Quest: (\w+)/)?.[1];
      console.log('Quest key found:', questKey);
      
      if (questKey) {
        console.log('Calling handleQuestClick with:', questKey);
        handleQuestClick(questKey);
      }
    } else {
      console.log('No quest item found for this click');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Questline Demo</h1>
        <p>Upload a ZIP file exported from the Figma Questline Plugin</p>
      </header>
      
      <main className="App-main">
        <div className="upload-section">
          <input
            type="file"
            accept=".zip"
            onChange={handleFileUpload}
            className="file-input"
          />
          {error && <div className="error-message">{error}</div>}
        </div>

        {extractedAssets && (
          <>
            <div className="controls-section">
              <h3>Responsive Controls</h3>
              <div className="control-group">
                <label>
                  Width: {containerWidth}px
                  <input
                    type="range"
                    min="200"
                    max={maxWidth}
                    value={containerWidth}
                    onChange={(e) => setContainerWidth(Number(e.target.value))}
                  />
                </label>
              </div>
              <div className="control-group">
                <label>
                  Height: {containerHeight}px
                  <input
                    type="range"
                    min="200"
                    max={maxHeight}
                    value={containerHeight}
                    onChange={(e) => setContainerHeight(Number(e.target.value))}
                  />
                </label>
              </div>
              <div className="preset-buttons">
                <button onClick={() => { setContainerWidth(400); setContainerHeight(300); }}>
                  Mobile
                </button>
                <button onClick={() => { setContainerWidth(800); setContainerHeight(600); }}>
                  Desktop
                </button>
                <button onClick={() => { setContainerWidth(Math.min(1200, maxWidth)); setContainerHeight(400); }}>
                  Wide
                </button>
              </div>
            </div>

            <div className="questline-container" onClick={handleContainerClick}>
              <QuestlineViewer
                questlineData={extractedAssets.questlineData}
                backgroundImage={extractedAssets.backgroundImage}
                questImages={extractedAssets.questImages}
                questStates={questStates}
                containerWidth={containerWidth}
                containerHeight={containerHeight}
              />
            </div>

            <div className="info-section">
              <h3>Quest States</h3>
              <p>Click on quests to cycle through states: locked → active → unclaimed → completed</p>
              <div className="quest-states">
                {extractedAssets.questlineData.quests.map(quest => (
                  <div key={quest.questKey} className="quest-state-item">
                    <strong>{quest.questKey}:</strong> {questStates[quest.questKey] || 'locked'}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
