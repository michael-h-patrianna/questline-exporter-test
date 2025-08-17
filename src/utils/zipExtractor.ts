import JSZip from 'jszip';
import { ExtractedAssets, QuestlineExport } from '../types';

export async function extractQuestlineZip(zipFile: File): Promise<ExtractedAssets> {
  const zip = new JSZip();
  const zipContent = await zip.loadAsync(zipFile);

  // Debug: Log all files in the ZIP
  console.log('Files in ZIP:', Object.keys(zipContent.files));

  // Extract positions.json (new format standard)
  const dataFile = zipContent.file('positions.json');

  if (!dataFile) {
    throw new Error('No positions.json file found in ZIP. Available files: ' + Object.keys(zipContent.files).join(', '));
  }

  const dataContent = await dataFile.async('string');
  const questlineData: QuestlineExport = JSON.parse(dataContent);

  // Extract background image (at root level in new format)
  let backgroundImage: string | undefined;
  if (questlineData.background?.exportUrl) {
    const bgFile = zipContent.file(questlineData.background.exportUrl);
    if (bgFile) {
      const bgBlob = await bgFile.async('blob');
      backgroundImage = URL.createObjectURL(bgBlob);
      console.log('Found background image:', questlineData.background.exportUrl);
    } else {
      console.warn('Background image not found:', questlineData.background.exportUrl);
    }
  }

  // Extract quest images (at root level in new format)
  const questImages: ExtractedAssets['questImages'] = {};

  for (const quest of questlineData.quests) {
    questImages[quest.questKey] = {};

    // Extract all quest state images
    const imageStates = [
      { state: 'locked', filename: quest.lockedImg },
      { state: 'active', filename: quest.activeImg },
      { state: 'unclaimed', filename: quest.unclaimedImg },
      { state: 'completed', filename: quest.completedImg }
    ] as const;

    for (const { state, filename } of imageStates) {
      if (filename) {
        const file = zipContent.file(filename);
        if (file) {
          const blob = await file.async('blob');
          questImages[quest.questKey][state] = URL.createObjectURL(blob);
          console.log(`Found quest image: ${quest.questKey} ${state} -> ${filename}`);
        } else {
          console.warn(`Missing quest image: ${quest.questKey} ${state} -> ${filename}`);
        }
      }
    }
  }

  // Extract header images (optional)
  let headerImages: ExtractedAssets['headerImages'] | undefined;
  if (questlineData.header) {
    headerImages = {};
    const headerImageStates = [
      { state: 'active', filename: questlineData.header.activeImg },
      { state: 'success', filename: questlineData.header.successImg },
      { state: 'fail', filename: questlineData.header.failImg }
    ] as const;

    for (const { state, filename } of headerImageStates) {
      if (filename) {
        const file = zipContent.file(filename);
        if (file) {
          const blob = await file.async('blob');
          headerImages[state] = URL.createObjectURL(blob);
          console.log(`Found header image: ${state} -> ${filename}`);
        } else {
          console.warn(`Missing header image: ${state} -> ${filename}`);
        }
      }
    }
  }

  // Extract rewards images (optional)
  let rewardsImages: ExtractedAssets['rewardsImages'] | undefined;
  if (questlineData.rewards) {
    rewardsImages = {};
    const rewardsImageStates = [
      { state: 'active', filename: questlineData.rewards.activeImg },
      { state: 'fail', filename: questlineData.rewards.failImg },
      { state: 'claimed', filename: questlineData.rewards.claimedImg },
      { state: 'unclaimed', filename: questlineData.rewards.unclaimedImg },
    ] as const;

    for (const { state, filename } of rewardsImageStates) {
      if (filename) {
        const file = zipContent.file(filename);
        if (file) {
          const blob = await file.async('blob');
          rewardsImages[state] = URL.createObjectURL(blob);
          console.log(`Found rewards image: ${state} -> ${filename}`);
        } else {
          console.warn(`Missing rewards image: ${state} -> ${filename}`);
        }
      }
    }
  }

  console.log('Extraction complete:', {
    questlineData,
    questImages,
    headerImages,
    rewardsImages,
    backgroundImage: !!backgroundImage
  });

  return {
    questlineData,
    backgroundImage,
    questImages,
    headerImages,
    rewardsImages
  };
}
