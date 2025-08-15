import React from 'react';
import { QuestlineViewer } from './components/QuestlineViewer';
import { ExtractedAssets, QuestlineExport } from './types';

// Example usage of the simplified QuestlineViewer component
export const QuestlineExample: React.FC = () => {
  // Mock questline data
  const questlineData: QuestlineExport = {
    questlineId: 'example-questline',
    background: {
      exportUrl: 'example-background.png'
    },
    exportedAt: new Date().toISOString(),
    metadata: {
      totalQuests: 2,
      exportFormat: 'simplified',
      version: '1.0.0'
    },
    frameSize: { width: 800, height: 600 },
    timer: {
      position: { x: 400, y: 50 },
      dimensions: { width: 120, height: 40 },
      borderRadius: 20,
      backgroundFill: {
        type: 'solid',
        color: '#333333'
      },
      isAutolayout: false,
      padding: { vertical: 8, horizontal: 16 },
      dropShadows: [],
      textStyle: {
        fontSize: 16,
        color: '#ffffff',
        fontWeight: 600,
        textAlignHorizontal: 'CENTER',
        textAlignVertical: 'CENTER'
      }
    },
    quests: [
      {
        questKey: 'quest1',
        stateBounds: {
          locked: { x: 100, y: 200, w: 80, h: 80, rotation: 0 },
          active: { x: 100, y: 200, w: 80, h: 80, rotation: 0 },
          unclaimed: { x: 100, y: 200, w: 80, h: 80, rotation: 0 },
          completed: { x: 100, y: 200, w: 80, h: 80, rotation: 0 }
        }
      },
      {
        questKey: 'quest2',
        stateBounds: {
          locked: { x: 300, y: 200, w: 80, h: 80, rotation: 0 },
          active: { x: 300, y: 200, w: 80, h: 80, rotation: 0 },
          unclaimed: { x: 300, y: 200, w: 80, h: 80, rotation: 0 },
          completed: { x: 300, y: 200, w: 80, h: 80, rotation: 0 }
        }
      }
    ],
    button: {
      position: { x: 400, y: 500 },
      stateStyles: {
        default: {
          frame: {
            borderRadius: 25,
            backgroundFill: {
              type: 'gradient',
              gradient: {
                type: 'linear',
                rotation: 90,
                stops: [
                  { color: '#4CAF50', position: 0 },
                  { color: '#45a049', position: 1 }
                ]
              }
            },
            isAutolayout: false,
            padding: { vertical: 12, horizontal: 24 },
            dropShadows: [
              { x: 0, y: 2, blur: 4, spread: 0, color: 'rgba(0,0,0,0.2)' }
            ]
          },
          text: {
            fontSize: 18,
            color: '#ffffff'
          }
        },
        hover: {
          frame: {
            borderRadius: 25,
            backgroundFill: {
              type: 'gradient',
              gradient: {
                type: 'linear',
                rotation: 90,
                stops: [
                  { color: '#5CBF60', position: 0 },
                  { color: '#55b059', position: 1 }
                ]
              }
            },
            isAutolayout: false,
            padding: { vertical: 12, horizontal: 24 },
            dropShadows: [
              { x: 0, y: 4, blur: 8, spread: 0, color: 'rgba(0,0,0,0.3)' }
            ]
          },
          text: {
            fontSize: 18,
            color: '#ffffff'
          }
        },
        active: {
          frame: {
            borderRadius: 25,
            backgroundFill: {
              type: 'solid',
              color: '#3e8e41'
            },
            isAutolayout: false,
            padding: { vertical: 12, horizontal: 24 },
            dropShadows: [
              { x: 0, y: 1, blur: 2, spread: 0, color: 'rgba(0,0,0,0.2)' }
            ]
          },
          text: {
            fontSize: 18,
            color: '#ffffff'
          }
        },
        disabled: {
          frame: {
            borderRadius: 25,
            backgroundFill: {
              type: 'solid',
              color: '#cccccc'
            },
            isAutolayout: false,
            padding: { vertical: 12, horizontal: 24 },
            dropShadows: []
          },
          text: {
            fontSize: 18,
            color: '#666666'
          }
        }
      }
    }
  };

  // Mock assets (no images for this example)
  const assets: ExtractedAssets = {
    questlineData,
    questImages: {},
    backgroundImage: undefined,
    headerImages: undefined,
    rewardsImages: undefined
  };

  const handleButtonClick = () => {
    console.log('Button clicked!');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Simplified QuestlineViewer Example</h2>
      <p>Click on components to cycle through their states:</p>

      <QuestlineViewer
        questlineData={questlineData}
        assets={assets}
        questlineWidth={900}
        questlineHeight={700}
        onButtonClick={handleButtonClick}
      />

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p><strong>Features demonstrated:</strong></p>
        <ul>
          <li>✅ Simple, single-component architecture</li>
          <li>✅ Direct positioning calculations</li>
          <li>✅ State management for all components</li>
          <li>✅ Gradient support with CSS conversion</li>
          <li>✅ Interactive state cycling</li>
          <li>✅ Fallback rendering when no images provided</li>
          <li>✅ Responsive scaling</li>
          <li>✅ Timer component with text styling</li>
          <li>✅ Button component with complete state support</li>
        </ul>
      </div>
    </div>
  );
};
