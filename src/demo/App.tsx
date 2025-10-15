import { ExtractedAssets } from '@lib';
import { QuestlineViewer } from '@lib/components/QuestlineViewer';
import { extractQuestlineZip } from '@lib/utils/zipExtractor';
import React, { useEffect, useState } from 'react';
import './App.css';
import { AppBar } from './components/AppBar';
import { Sidebar } from './components/Sidebar';

function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [extractedAssets, setExtractedAssets] = useState<ExtractedAssets | null>(null);
  const [questlineWidth, setQuestlineWidth] = useState(375);
  const [questlineHeight, setQuestlineHeight] = useState(812);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Component visibility state
  const [componentVisibility, setComponentVisibility] = useState({
    background: true,
    header: true,
    quests: true,
    rewards: true,
    timer: true,
    button: true,
  });

  // Quest key display state
  const [showQuestKeys, setShowQuestKeys] = useState(false);

  const toggleComponentVisibility = (component: keyof typeof componentVisibility) => {
    setComponentVisibility((prev) => ({
      ...prev,
      [component]: !prev[component],
    }));
  };

  // Auto-load theme.zip if it exists in public/assets
  useEffect(() => {
    const autoLoadTheme = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Attempt to fetch the theme.zip file
        const response = await fetch('/assets/theme.zip');

        if (!response.ok) {
          // Theme file doesn't exist, silently continue
          return;
        }

        // Convert response to blob and then to File
        const blob = await response.blob();
        const file = new File([blob], 'theme.zip', { type: 'application/zip' });

        // Load the theme using the same logic as handleFileUpload
        const assets = await extractQuestlineZip(file);
        setExtractedAssets(assets);

        // Auto-set questline dimensions to match the original frame size
        const frameWidth = assets.questlineData.frameSize?.width || 375;
        const frameHeight = assets.questlineData.frameSize?.height || 812;
        setQuestlineWidth(frameWidth);
        setQuestlineHeight(frameHeight);
      } catch (err) {
        // Silently fail if theme doesn't exist or can't be loaded
        // No action needed - user can still upload their own theme
        console.warn('Theme auto-load failed (this is normal if no theme.zip exists):', err);
      } finally {
        setIsLoading(false);
      }
    };

    autoLoadTheme();
  }, []); // Only run once on mount

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      setIsLoading(true);

      const assets = await extractQuestlineZip(file);
      setExtractedAssets(assets);

      // Auto-set questline dimensions to match the original frame size
      const frameWidth = assets.questlineData.frameSize?.width || 375;
      const frameHeight = assets.questlineData.frameSize?.height || 812;
      setQuestlineWidth(frameWidth);
      setQuestlineHeight(frameHeight);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract ZIP file');
    } finally {
      setIsLoading(false);
    }
  };

  // Close drawer on ESC
  useEffect(() => {
    if (!isDrawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDrawerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isDrawerOpen]);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isDrawerOpen]);

  return (
    <div className="App">
      {/* App Bar (Mobile Header) */}
      <AppBar
        onMenuClick={() => setIsDrawerOpen(true)}
        title="Questline Demo"
        githubUrl="https://github.com/michael-h-patrianna/questline-exporter-test"
      />

      <main className="App-main">
        <div className="layout-container">
          {/* Desktop Sidebar */}
          <Sidebar
            extractedAssets={extractedAssets}
            isLoading={isLoading}
            error={error}
            questlineWidth={questlineWidth}
            questlineHeight={questlineHeight}
            componentVisibility={componentVisibility}
            showQuestKeys={showQuestKeys}
            onFileUpload={handleFileUpload}
            onQuestlineWidthChange={setQuestlineWidth}
            onQuestlineHeightChange={setQuestlineHeight}
            onToggleComponentVisibility={toggleComponentVisibility}
            onToggleShowQuestKeys={setShowQuestKeys}
            className="desktop-sidebar"
          />

          {/* Main Content Area */}
          <div className="main-content">
            {extractedAssets && (
              <div className="questline-container">
                <QuestlineViewer
                  questlineData={extractedAssets.questlineData}
                  assets={extractedAssets}
                  questlineWidth={questlineWidth}
                  questlineHeight={questlineHeight}
                  componentVisibility={componentVisibility}
                  showQuestKeys={showQuestKeys}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Drawer for mobile sidebar */}
      <div
        id="app-sidebar-drawer"
        role="dialog"
        aria-modal="true"
        aria-hidden={!isDrawerOpen}
        hidden={!isDrawerOpen}
        className={`app-drawer ${isDrawerOpen ? 'is-open' : ''}`}
      >
        <div className="app-drawer__overlay" onClick={() => setIsDrawerOpen(false)} />
        <div className="app-drawer__panel">
          <div className="app-drawer__panel-header">
            <button
              type="button"
              className="app-drawer__close"
              aria-label="Close menu"
              onClick={() => setIsDrawerOpen(false)}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <Sidebar
            extractedAssets={extractedAssets}
            isLoading={isLoading}
            error={error}
            questlineWidth={questlineWidth}
            questlineHeight={questlineHeight}
            componentVisibility={componentVisibility}
            showQuestKeys={showQuestKeys}
            onFileUpload={handleFileUpload}
            onQuestlineWidthChange={setQuestlineWidth}
            onQuestlineHeightChange={setQuestlineHeight}
            onToggleComponentVisibility={toggleComponentVisibility}
            onToggleShowQuestKeys={setShowQuestKeys}
            className="drawer-sidebar"
          />
        </div>
      </div>
    </div>
  );
}

export default App;
