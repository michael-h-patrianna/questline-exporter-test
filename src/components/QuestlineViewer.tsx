import React from 'react';
import { QuestlineData, QuestState } from '../types';
import './QuestlineViewer.css';

interface QuestlineViewerProps {
  questlineData: QuestlineData;
  backgroundImage?: string;
  questImages: {
    [questKey: string]: {
      locked?: string;
      open?: string;
      closed?: string;
    };
  };
  questStates: QuestState;
  containerWidth: number;
  containerHeight: number;
}

export const QuestlineViewer: React.FC<QuestlineViewerProps> = ({
  questlineData,
  backgroundImage,
  questImages,
  questStates,
  containerWidth,
  containerHeight
}) => {
  // Validate questline data dimensions
  const validWidth = questlineData.frameSize?.width && !isNaN(questlineData.frameSize.width) ? questlineData.frameSize.width : 800;
  const validHeight = questlineData.frameSize?.height && !isNaN(questlineData.frameSize.height) ? questlineData.frameSize.height : 600;
  
  console.log('QuestlineViewer props:', { questlineData, backgroundImage, questImages, questStates, containerWidth, containerHeight });
  console.log('Valid dimensions:', { validWidth, validHeight });
  
  // Calculate scaling factors to fit the questline in the container
  const scaleX = containerWidth / validWidth;
  const scaleY = containerHeight / validHeight;
  const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
  
  const scaledWidth = validWidth * scale;
  const scaledHeight = validHeight * scale;
  
  return (
    <div 
      className="questline-container-wrapper"
      style={{
        width: containerWidth,
        height: containerHeight,
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        minHeight: '300px'
      }}
    >
      <div className="container-label">
        Container: {containerWidth}px × {containerHeight}px
      </div>
      <div 
        className="questline-viewer"
        style={{
          width: scaledWidth,
          height: scaledHeight,
          position: 'relative',
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '1px solid #ccc',
          margin: '0 auto'
        }}
      >
      {questlineData.quests.map((quest) => {
        const questState = questStates[quest.questKey] || 'locked';
        // Map 'open' state to 'done' for the new structure
        const imageState = questState === 'open' ? 'done' : questState;
        const questImage = (questImages[quest.questKey] as any)?.[imageState];
        
        if (!questImage) {
          return null;
        }
        
        // Validate quest dimensions
        const validX = quest.x && !isNaN(quest.x) ? quest.x : 0;
        const validY = quest.y && !isNaN(quest.y) ? quest.y : 0;
        const validW = quest.w && !isNaN(quest.w) ? quest.w : 50;
        const validH = quest.h && !isNaN(quest.h) ? quest.h : 50;
        
        return (
          <div
            key={quest.questKey}
            className="quest-item"
            data-quest-key={quest.questKey}
            style={{
              position: 'absolute',
              left: validX * scale,
              top: validY * scale,
              width: validW * scale,
              height: validH * scale,
              cursor: 'pointer',
              transition: 'opacity 0.2s ease'
            }}
            title={`Quest: ${quest.questKey} (${questState})`}
          >
            <img
              src={questImage}
              alt={`${quest.questKey} - ${questState}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </div>
        );
      })}
      </div>
    </div>
  );
}; 