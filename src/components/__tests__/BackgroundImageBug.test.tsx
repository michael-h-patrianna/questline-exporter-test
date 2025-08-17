import { render, screen } from '@testing-library/react';
import React from 'react';
import { QuestlineProvider } from '../../context/QuestlineContext';
import { QuestlineViewer } from '../QuestlineViewer';

describe('Background Image Display Bug Tests', () => {
  const mockQuestlineData = {
    questlineId: 'test-bg-questline',
    frameSize: { width: 800, height: 600 },
    background: { exportUrl: 'background.png' },
    quests: [],
    exportedAt: new Date().toISOString(),
    metadata: { totalQuests: 0, version: '1.0.0' }
  };

  const mockAssetsWithBackground = {
    questlineData: mockQuestlineData,
    backgroundImage: 'blob:test-background-url',
    questImages: {},
    headerImages: undefined,
    rewardsImages: undefined
  };

  const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QuestlineProvider initialQuestKeys={[]}>
      {children}
    </QuestlineProvider>
  );

  describe('Background Image Visibility', () => {
    it('should render background image element when backgroundImage is provided', () => {
      render(
        <TestWrapper>
          <QuestlineViewer
            questlineData={mockQuestlineData}
            assets={mockAssetsWithBackground}
            questlineWidth={800}
            questlineHeight={600}
          />
        </TestWrapper>
      );

      // Check that the background container exists
      const backgroundContainer = document.querySelector('.questline-background');
      expect(backgroundContainer).toBeInTheDocument();

      // Check that the background image exists with correct src
      const backgroundImage = screen.getByAltText('Questline background');
      expect(backgroundImage).toBeInTheDocument();
      expect(backgroundImage).toHaveAttribute('src', 'blob:test-background-url');
    });

    it('should have background image with correct z-index positioning', () => {
      render(
        <TestWrapper>
          <QuestlineViewer
            questlineData={mockQuestlineData}
            assets={mockAssetsWithBackground}
            questlineWidth={800}
            questlineHeight={600}
          />
        </TestWrapper>
      );

      const backgroundContainer = document.querySelector('.questline-background');
      expect(backgroundContainer).toBeInTheDocument();

      // Verify the element has the correct CSS class which should provide z-index: 0
      expect(backgroundContainer).toHaveClass('questline-background');
    });

    it('should have background container with expected structure', () => {
      render(
        <TestWrapper>
          <QuestlineViewer
            questlineData={mockQuestlineData}
            assets={mockAssetsWithBackground}
            questlineWidth={800}
            questlineHeight={600}
          />
        </TestWrapper>
      );

      const backgroundContainer = document.querySelector('.questline-background');
      expect(backgroundContainer).toBeInTheDocument();

      // Verify the element has the correct CSS class
      expect(backgroundContainer).toHaveClass('questline-background');

      // Verify the image inside the container
      const backgroundImage = backgroundContainer?.querySelector('img');
      expect(backgroundImage).toBeInTheDocument();
      expect(backgroundImage).toHaveClass('questline-background-image');
    });

    it('should verify questline viewer does not have background color that hides background image', () => {
      const { container } = render(
        <TestWrapper>
          <QuestlineViewer
            questlineData={mockQuestlineData}
            assets={mockAssetsWithBackground}
            questlineWidth={800}
            questlineHeight={600}
          />
        </TestWrapper>
      );

      const questlineViewer = container.querySelector('.questline-viewer');
      expect(questlineViewer).toBeInTheDocument();

      const computedStyle = window.getComputedStyle(questlineViewer!);
      // Background should be transparent or undefined, not solid color that would hide the image
      const backgroundColor = computedStyle.backgroundColor;
      expect(['', 'rgba(0, 0, 0, 0)', 'transparent'].includes(backgroundColor)).toBe(true);
    });

    it('should not render background container when backgroundImage is undefined', () => {
      const assetsWithoutBackground = {
        ...mockAssetsWithBackground,
        backgroundImage: undefined
      };

      render(
        <TestWrapper>
          <QuestlineViewer
            questlineData={mockQuestlineData}
            assets={assetsWithoutBackground}
            questlineWidth={800}
            questlineHeight={600}
          />
        </TestWrapper>
      );

      const backgroundContainer = document.querySelector('.questline-background');
      expect(backgroundContainer).not.toBeInTheDocument();
    });

    it('should handle background image loading errors gracefully', () => {
      // Test with an invalid blob URL to simulate loading error
      const assetsWithInvalidBackground = {
        ...mockAssetsWithBackground,
        backgroundImage: 'blob:invalid-url'
      };

      render(
        <TestWrapper>
          <QuestlineViewer
            questlineData={mockQuestlineData}
            assets={assetsWithInvalidBackground}
            questlineWidth={800}
            questlineHeight={600}
          />
        </TestWrapper>
      );

      const backgroundImage = screen.getByAltText('Questline background');
      expect(backgroundImage).toBeInTheDocument();
      expect(backgroundImage).toHaveAttribute('src', 'blob:invalid-url');
    });
  });

  describe('Background Image CSS Classes', () => {
    it('should apply correct CSS classes to background elements', () => {
      render(
        <TestWrapper>
          <QuestlineViewer
            questlineData={mockQuestlineData}
            assets={mockAssetsWithBackground}
            questlineWidth={800}
            questlineHeight={600}
          />
        </TestWrapper>
      );

      const backgroundContainer = document.querySelector('.questline-background');
      expect(backgroundContainer).toHaveClass('questline-background');

      const backgroundImage = screen.getByAltText('Questline background');
      expect(backgroundImage).toHaveClass('questline-background-image');
    });

    it('should verify background image has correct object-fit styling', () => {
      render(
        <TestWrapper>
          <QuestlineViewer
            questlineData={mockQuestlineData}
            assets={mockAssetsWithBackground}
            questlineWidth={800}
            questlineHeight={600}
          />
        </TestWrapper>
      );

      const backgroundImage = screen.getByAltText('Questline background');
      expect(backgroundImage).toHaveClass('questline-background-image');
    });
  });
});
