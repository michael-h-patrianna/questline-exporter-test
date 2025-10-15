import JSZip from 'jszip';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { QuestlineExport } from '../../types';
import { extractQuestlineZip } from '../zipExtractor';

// Mock JSZip
vi.mock('jszip');

describe('zipExtractor', () => {
  let mockZip: any;
  let mockFile: any;
  let consoleLogSpy: any;
  let consoleWarnSpy: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock console methods
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Mock file object
    mockFile = vi.fn();

    // Mock ZIP instance
    mockZip = {
      loadAsync: vi.fn(),
      file: mockFile,
      files: {},
    };

    // Mock JSZip constructor
    (JSZip as any).mockImplementation(() => mockZip);

    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi
      .fn()
      .mockImplementation(
        (blob: Blob) =>
          `blob:${blob.type || 'application/octet-stream'}/${Math.random().toString(36)}`
      );
  });

  const createMockQuestlineData = (): QuestlineExport => ({
    questlineId: 'test-questline',
    frameSize: { width: 800, height: 600 },
    background: { exportUrl: 'background.png' },
    quests: [
      {
        questKey: 'quest1',
        stateBounds: {
          locked: { x: 10, y: 20, width: 100, height: 50 },
          active: { x: 15, y: 25, width: 105, height: 55 },
          unclaimed: { x: 20, y: 30, width: 110, height: 60 },
          completed: { x: 25, y: 35, width: 115, height: 65 },
        },
        lockedImg: 'quest1_locked.png',
        activeImg: 'quest1_active.png',
        unclaimedImg: 'quest1_unclaimed.png',
        completedImg: 'quest1_completed.png',
      },
    ],
    timer: {
      position: { x: 400, y: 50 },
      dimensions: { width: 120, height: 40 },
      borderRadius: 8,
      backgroundFill: { type: 'solid', color: '#000000' },
      isAutolayout: false,
      layoutSizing: { horizontal: 'fixed', vertical: 'fixed' },
      padding: { vertical: 8, horizontal: 16 },
      dropShadows: [],
      textStyle: {
        fontSize: 14,
        color: '#ffffff',
        fontWeight: 500,
        textAlignHorizontal: 'center',
        textAlignVertical: 'center',
      },
    },
    header: {
      stateBounds: {
        active: { x: 400, y: 100, width: 300, height: 50 },
        success: { x: 400, y: 100, width: 300, height: 50 },
        fail: { x: 400, y: 100, width: 300, height: 50 },
      },
      activeImg: 'header_active.png',
      successImg: 'header_success.png',
      failImg: 'header_fail.png',
    },
    rewards: {
      stateBounds: {
        active: { x: 600, y: 400, width: 150, height: 100 },
        fail: { x: 600, y: 400, width: 150, height: 100 },
        claimed: { x: 600, y: 400, width: 150, height: 100 },
        unclaimed: { x: 600, y: 400, width: 150, height: 100 },
      },
      activeImg: 'rewards_active.png',
      failImg: 'rewards_fail.png',
      claimedImg: 'rewards_claimed.png',
      unclaimedImg: 'rewards_unclaimed.png',
    },
    button: {
      position: { x: 400, y: 500 },
      stateStyles: {
        default: {
          frame: {
            borderRadius: 4,
            backgroundFill: { type: 'solid', color: '#007bff' },
            isAutolayout: false,
            layoutSizing: { horizontal: 'fixed', vertical: 'fixed' },
            padding: { vertical: 12, horizontal: 24 },
            dropShadows: [],
          },
          text: { fontSize: 16, color: '#ffffff' },
        },
        disabled: {
          frame: {
            borderRadius: 4,
            backgroundFill: { type: 'solid', color: '#6c757d' },
            isAutolayout: false,
            layoutSizing: { horizontal: 'fixed', vertical: 'fixed' },
            padding: { vertical: 12, horizontal: 24 },
            dropShadows: [],
          },
          text: { fontSize: 16, color: '#ffffff' },
        },
        hover: {
          frame: {
            borderRadius: 4,
            backgroundFill: { type: 'solid', color: '#0056b3' },
            isAutolayout: false,
            layoutSizing: { horizontal: 'fixed', vertical: 'fixed' },
            padding: { vertical: 12, horizontal: 24 },
            dropShadows: [],
          },
          text: { fontSize: 16, color: '#ffffff' },
        },
        active: {
          frame: {
            borderRadius: 4,
            backgroundFill: { type: 'solid', color: '#004085' },
            isAutolayout: false,
            layoutSizing: { horizontal: 'fixed', vertical: 'fixed' },
            padding: { vertical: 12, horizontal: 24 },
            dropShadows: [],
          },
          text: { fontSize: 16, color: '#ffffff' },
        },
      },
    },
    exportedAt: '2024-01-01T00:00:00.000Z',
    metadata: {
      totalQuests: 1,
      version: '1.0.0',
    },
  });

  const createMockFile = (content: string | object) => {
    const stringContent = typeof content === 'object' ? JSON.stringify(content) : content;
    return {
      async: vi.fn().mockImplementation((type: string) => {
        if (type === 'string') return Promise.resolve(stringContent);
        if (type === 'blob') return Promise.resolve(new Blob([stringContent]));
        return Promise.resolve(stringContent);
      }),
    };
  };

  describe('positions_full.json support (new feature)', () => {
    it('should prioritize positions_full.json over positions.json when both exist', async () => {
      const fullData = createMockQuestlineData();
      const legacyData = { ...fullData, questlineId: 'legacy-data' };
      const mockZipFile = new File(['mock'], 'test.zip', { type: 'application/zip' });

      mockZip.files = {
        'positions_full.json': {} as any,
        'positions.json': {} as any,
        'background.png': {} as any,
      };

      mockFile.mockImplementation((filename: string) => {
        if (filename === 'positions_full.json') {
          return createMockFile(fullData);
        }
        if (filename === 'positions.json') {
          return createMockFile(legacyData);
        }
        if (filename.endsWith('.png')) {
          return createMockFile('mock image data');
        }
        return null;
      });

      mockZip.loadAsync.mockResolvedValue(mockZip);

      const result = await extractQuestlineZip(mockZipFile);

      // Should use positions_full.json data, not positions.json
      expect(result.questlineData.questlineId).toBe('test-questline');
      expect(result.questlineData.questlineId).not.toBe('legacy-data');
    });

    it('should fall back to positions.json when positions_full.json does not exist', async () => {
      const legacyData = createMockQuestlineData();
      const mockZipFile = new File(['mock'], 'test.zip', { type: 'application/zip' });

      mockZip.files = {
        'positions.json': {} as any,
        'background.png': {} as any,
      };

      mockFile.mockImplementation((filename: string) => {
        if (filename === 'positions_full.json') {
          return null; // Does not exist
        }
        if (filename === 'positions.json') {
          return createMockFile(legacyData);
        }
        if (filename.endsWith('.png')) {
          return createMockFile('mock image data');
        }
        return null;
      });

      mockZip.loadAsync.mockResolvedValue(mockZip);

      const result = await extractQuestlineZip(mockZipFile);

      // Should successfully use positions.json
      expect(result.questlineData).toEqual(legacyData);
    });

    it('should throw error when neither positions_full.json nor positions.json exist', async () => {
      const mockZipFile = new File(['mock'], 'test.zip', { type: 'application/zip' });

      mockZip.files = {
        'background.png': {} as any,
        'other_file.txt': {} as any,
      };

      mockFile.mockReturnValue(null);
      mockZip.loadAsync.mockResolvedValue(mockZip);

      await expect(extractQuestlineZip(mockZipFile)).rejects.toThrow(
        'No positions_full.json or positions.json file found in ZIP'
      );
    });

    it('should include available files in error message when no positions file found', async () => {
      const mockZipFile = new File(['mock'], 'test.zip', { type: 'application/zip' });

      mockZip.files = {
        'image1.png': {} as any,
        'image2.png': {} as any,
        'readme.txt': {} as any,
      };

      mockFile.mockReturnValue(null);
      mockZip.loadAsync.mockResolvedValue(mockZip);

      await expect(extractQuestlineZip(mockZipFile)).rejects.toThrow(
        /Available files:.*image1\.png.*image2\.png.*readme\.txt/
      );
    });
  });

  describe('successful extraction (legacy positions.json)', () => {
    it('should extract questline with all components using positions.json', async () => {
      const questlineData = createMockQuestlineData();
      const mockZipFile = new File(['mock'], 'test.zip', { type: 'application/zip' });

      mockZip.files = {
        'positions.json': {} as any,
        'background.png': {} as any,
        'quest1_locked.png': {} as any,
        'quest1_active.png': {} as any,
        'quest1_unclaimed.png': {} as any,
        'quest1_completed.png': {} as any,
        'header_active.png': {} as any,
        'header_success.png': {} as any,
        'header_fail.png': {} as any,
        'rewards_active.png': {} as any,
        'rewards_fail.png': {} as any,
        'rewards_claimed.png': {} as any,
      };

      mockFile.mockImplementation((filename: string) => {
        if (filename === 'positions_full.json') return null;
        if (filename === 'positions.json') {
          return createMockFile(questlineData);
        }
        if (filename.endsWith('.png')) {
          return createMockFile('mock image data');
        }
        return null;
      });

      mockZip.loadAsync.mockResolvedValue(mockZip);

      const result = await extractQuestlineZip(mockZipFile);

      expect(result.questlineData).toEqual(questlineData);
      expect(result.backgroundImage).toBeDefined();
      expect(result.questImages.quest1.locked).toBeDefined();
      expect(result.questImages.quest1.active).toBeDefined();
      expect(result.questImages.quest1.unclaimed).toBeDefined();
      expect(result.questImages.quest1.completed).toBeDefined();
      expect(result.headerImages?.active).toBeDefined();
      expect(result.headerImages?.success).toBeDefined();
      expect(result.headerImages?.fail).toBeDefined();
      expect(result.rewardsImages?.active).toBeDefined();
      expect(result.rewardsImages?.fail).toBeDefined();
      expect(result.rewardsImages?.claimed).toBeDefined();
    });

    it('should extract questline without optional components', async () => {
      const questlineData = {
        ...createMockQuestlineData(),
        timer: undefined,
        header: undefined,
        rewards: undefined,
        button: undefined,
      };

      mockZip.files = {
        'positions.json': {} as any,
        'background.png': {} as any,
        'quest1_locked.png': {} as any,
        'quest1_active.png': {} as any,
        'quest1_unclaimed.png': {} as any,
        'quest1_completed.png': {} as any,
      };

      mockFile.mockImplementation((filename: string) => {
        if (filename === 'positions_full.json') return null;
        if (filename === 'positions.json') {
          return createMockFile(questlineData);
        }
        if (filename.endsWith('.png')) {
          return createMockFile('mock image data');
        }
        return null;
      });

      mockZip.loadAsync.mockResolvedValue(mockZip);

      const mockZipFile = new File(['mock'], 'test.zip', { type: 'application/zip' });
      const result = await extractQuestlineZip(mockZipFile);

      expect(result.questlineData).toEqual(questlineData);
      expect(result.headerImages).toBeUndefined();
      expect(result.rewardsImages).toBeUndefined();
      expect(result.questImages.quest1.locked).toBeDefined();
    });

    it('should handle missing images gracefully', async () => {
      const questlineData = createMockQuestlineData();
      const mockZipFile = new File(['mock'], 'test.zip', { type: 'application/zip' });

      mockZip.files = { 'positions.json': {} as any };

      mockFile.mockImplementation((filename: string) => {
        if (filename === 'positions_full.json') return null;
        if (filename === 'positions.json') {
          return createMockFile(questlineData);
        }
        return null; // All images missing
      });

      mockZip.loadAsync.mockResolvedValue(mockZip);

      const result = await extractQuestlineZip(mockZipFile);

      expect(result.questlineData).toEqual(questlineData);
      expect(result.backgroundImage).toBeUndefined();
      expect(result.questImages.quest1.locked).toBeUndefined();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Background image not found:', 'background.png');
    });

    it('should log extraction progress', async () => {
      const questlineData = createMockQuestlineData();
      const mockZipFile = new File(['mock'], 'test.zip', { type: 'application/zip' });

      mockZip.files = {
        'positions.json': {} as any,
        'background.png': {} as any,
        'quest1_locked.png': {} as any,
      };

      mockFile.mockImplementation((filename: string) => {
        if (filename === 'positions_full.json') return null;
        if (filename === 'positions.json') {
          return createMockFile(questlineData);
        }
        if (filename.endsWith('.png')) {
          return createMockFile('mock image data');
        }
        return null;
      });

      mockZip.loadAsync.mockResolvedValue(mockZip);

      await extractQuestlineZip(mockZipFile);

      expect(consoleLogSpy).toHaveBeenCalledWith('Files in ZIP:', [
        'positions.json',
        'background.png',
        'quest1_locked.png',
      ]);
      expect(consoleLogSpy).toHaveBeenCalledWith('Found background image:', 'background.png');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Found quest image: quest1 locked -> quest1_locked.png'
      );
    });
  });

  describe('error handling', () => {
    it('should throw error when positions.json contains invalid JSON', async () => {
      const mockZipFile = new File(['mock'], 'test.zip', { type: 'application/zip' });

      mockZip.files = { 'positions.json': {} as any };
      mockFile.mockImplementation((filename: string) => {
        if (filename === 'positions_full.json') return null;
        if (filename === 'positions.json') {
          return createMockFile('invalid json {');
        }
        return null;
      });
      mockZip.loadAsync.mockResolvedValue(mockZip);

      await expect(extractQuestlineZip(mockZipFile)).rejects.toThrow();
    });

    it('should handle ZIP loading errors', async () => {
      const mockZipFile = new File(['mock'], 'test.zip', { type: 'application/zip' });

      mockZip.loadAsync.mockRejectedValue(new Error('Failed to load ZIP'));

      await expect(extractQuestlineZip(mockZipFile)).rejects.toThrow('Failed to load ZIP');
    });

    it('should handle file reading errors', async () => {
      const mockZipFile = new File(['mock'], 'test.zip', { type: 'application/zip' });

      mockZip.files = { 'positions.json': {} as any };
      mockFile.mockImplementation((filename: string) => {
        if (filename === 'positions_full.json') return null;
        if (filename === 'positions.json') {
          return {
            async: vi.fn().mockRejectedValue(new Error('File read error')),
          };
        }
        return null;
      });
      mockZip.loadAsync.mockResolvedValue(mockZip);

      await expect(extractQuestlineZip(mockZipFile)).rejects.toThrow('File read error');
    });
  });

  describe('edge cases', () => {
    it('should handle empty quest array', async () => {
      const questlineData = {
        ...createMockQuestlineData(),
        quests: [],
      };
      const mockZipFile = new File(['mock'], 'test.zip', { type: 'application/zip' });

      mockZip.files = { 'positions.json': {} as any };
      mockFile.mockImplementation((filename: string) => {
        if (filename === 'positions_full.json') return null;
        if (filename === 'positions.json') {
          return createMockFile(questlineData);
        }
        return null;
      });
      mockZip.loadAsync.mockResolvedValue(mockZip);

      const result = await extractQuestlineZip(mockZipFile);

      expect(result.questlineData.quests).toEqual([]);
      expect(result.questImages).toEqual({});
    });

    it('should handle quest with missing image filenames', async () => {
      const questlineData = {
        ...createMockQuestlineData(),
        quests: [
          {
            questKey: 'quest1',
            stateBounds: {
              locked: { x: 10, y: 20, width: 100, height: 50 },
              active: { x: 15, y: 25, width: 105, height: 55 },
              unclaimed: { x: 20, y: 30, width: 110, height: 60 },
              completed: { x: 25, y: 35, width: 115, height: 65 },
            },
            lockedImg: '',
            activeImg: '',
            unclaimedImg: '',
            completedImg: '',
          },
        ],
      };
      const mockZipFile = new File(['mock'], 'test.zip', { type: 'application/zip' });

      mockZip.files = { 'positions.json': {} as any };
      mockFile.mockImplementation((filename: string) => {
        if (filename === 'positions_full.json') return null;
        if (filename === 'positions.json') {
          return createMockFile(questlineData);
        }
        return null;
      });
      mockZip.loadAsync.mockResolvedValue(mockZip);

      const result = await extractQuestlineZip(mockZipFile);

      expect(result.questImages.quest1.locked).toBeUndefined();
      expect(result.questImages.quest1.active).toBeUndefined();
      expect(result.questImages.quest1.unclaimed).toBeUndefined();
      expect(result.questImages.quest1.completed).toBeUndefined();
    });

    it('should handle multiple quests with mixed image availability', async () => {
      const questlineData = {
        ...createMockQuestlineData(),
        quests: [
          {
            questKey: 'quest1',
            stateBounds: {
              locked: { x: 10, y: 20, width: 100, height: 50 },
              active: { x: 15, y: 25, width: 105, height: 55 },
              unclaimed: { x: 20, y: 30, width: 110, height: 60 },
              completed: { x: 25, y: 35, width: 115, height: 65 },
            },
            lockedImg: 'quest1_locked.png',
            activeImg: 'quest1_active.png',
            unclaimedImg: 'quest1_unclaimed.png',
            completedImg: 'quest1_completed.png',
          },
          {
            questKey: 'quest2',
            stateBounds: {
              locked: { x: 200, y: 20, width: 100, height: 50 },
              active: { x: 205, y: 25, width: 105, height: 55 },
              unclaimed: { x: 210, y: 30, width: 110, height: 60 },
              completed: { x: 215, y: 35, width: 115, height: 65 },
            },
            lockedImg: 'quest2_locked.png',
            activeImg: 'quest2_active.png',
            unclaimedImg: 'quest2_unclaimed.png',
            completedImg: 'quest2_completed.png',
          },
        ],
      };
      const mockZipFile = new File(['mock'], 'test.zip', { type: 'application/zip' });

      mockZip.files = {
        'positions.json': {} as any,
        'quest1_locked.png': {} as any,
        'quest1_active.png': {} as any,
        // quest2 images are missing
      };

      mockFile.mockImplementation((filename: string) => {
        if (filename === 'positions_full.json') return null;
        if (filename === 'positions.json') {
          return createMockFile(questlineData);
        }
        if (filename === 'quest1_locked.png' || filename === 'quest1_active.png') {
          return createMockFile('mock image data');
        }
        return null;
      });
      mockZip.loadAsync.mockResolvedValue(mockZip);

      const result = await extractQuestlineZip(mockZipFile);

      expect(result.questImages.quest1.locked).toBeDefined();
      expect(result.questImages.quest1.active).toBeDefined();
      expect(result.questImages.quest1.unclaimed).toBeUndefined();
      expect(result.questImages.quest1.completed).toBeUndefined();

      expect(result.questImages.quest2.locked).toBeUndefined();
      expect(result.questImages.quest2.active).toBeUndefined();
      expect(result.questImages.quest2.unclaimed).toBeUndefined();
      expect(result.questImages.quest2.completed).toBeUndefined();
    });
  });

  describe('memory management', () => {
    it('should call URL.createObjectURL for each image', async () => {
      // Create simplified questline data with fewer images
      const questlineData = {
        questlineId: 'test-questline',
        frameSize: { width: 800, height: 600 },
        background: { exportUrl: 'background.png' },
        quests: [
          {
            questKey: 'quest1',
            stateBounds: {
              locked: { x: 10, y: 10, width: 80, height: 60 },
            },
            lockedImg: 'quest1_locked.png',
          },
        ],
        exportedAt: new Date().toISOString(),
        metadata: { totalQuests: 1, version: '1.0.0' },
      };

      const mockZipFile = new File(['mock'], 'test.zip', { type: 'application/zip' });

      mockZip.files = {
        'positions.json': {} as any,
        'background.png': {} as any,
        'quest1_locked.png': {} as any,
      };

      mockFile.mockImplementation((filename: string) => {
        if (filename === 'positions_full.json') return null;
        if (filename === 'positions.json') {
          return createMockFile(questlineData);
        }
        if (filename.endsWith('.png')) {
          return createMockFile('mock image data');
        }
        return null;
      });

      mockZip.loadAsync.mockResolvedValue(mockZip);

      await extractQuestlineZip(mockZipFile);

      // Should create blob URLs for each PNG file found in the ZIP
      // The test setup includes background.png and quest1_locked.png
      expect(global.URL.createObjectURL).toHaveBeenCalledTimes(2);
    });
  });
});
