import JSZip from 'jszip';
import { QuestlineData, ExtractedAssets } from '../types';

export async function extractQuestlineZip(zipFile: File): Promise<ExtractedAssets> {
  const zip = new JSZip();
  const zipContent = await zip.loadAsync(zipFile);
  
  // Debug: Log all files in the ZIP
  console.log('Files in ZIP:', Object.keys(zipContent.files));
  
  // Extract questline data - try different possible names
  let dataFile = zipContent.file('positions.json');
  if (!dataFile) {
    dataFile = zipContent.file('questline-data.json');
  }
  if (!dataFile) {
    // Try to find any JSON file
    const jsonFiles = Object.keys(zipContent.files).filter(filename => 
      filename.endsWith('.json')
    );
    console.log('JSON files found:', jsonFiles);
    if (jsonFiles.length > 0) {
      dataFile = zipContent.file(jsonFiles[0]);
    }
  }
  
  if (!dataFile) {
    throw new Error('No JSON data file found in ZIP. Available files: ' + Object.keys(zipContent.files).join(', '));
  }
  
  const dataContent = await dataFile.async('string');
  const questlineData: QuestlineData = JSON.parse(dataContent);
  
  // Extract background image
  let backgroundImage: string | undefined;
  if (questlineData.background?.exportUrl) {
    // Look for background in subdirectory
    const bgFile = zipContent.file(`questline-${questlineData.questlineId}/${questlineData.background.exportUrl}`);
    if (bgFile) {
      const bgBlob = await bgFile.async('blob');
      backgroundImage = URL.createObjectURL(bgBlob);
      console.log('Found background image:', questlineData.background.exportUrl);
    }
  }
  
  // Extract quest images
  const questImages: ExtractedAssets['questImages'] = {};
  
  console.log('Questline data:', questlineData);
  
  for (const quest of questlineData.quests) {
    questImages[quest.questKey] = {};
    
    // Use the image filenames from the JSON data
    const imageStates = [
      { state: 'locked', filename: quest.lockedImg },
      { state: 'active', filename: quest.activeImg },
      { state: 'unclaimed', filename: quest.unclaimedImg },
      { state: 'completed', filename: quest.completedImg }
    ];
    
    console.log(`Quest ${quest.questKey} image states:`, imageStates);
    
    for (const { state, filename } of imageStates) {
      if (filename) {
        // Look for image in subdirectory
        const fullPath = `questline-${questlineData.questlineId}/${filename}`;
        const file = zipContent.file(fullPath);
        
        if (file) {
          const blob = await file.async('blob');
          (questImages[quest.questKey] as any)[state] = URL.createObjectURL(blob);
          console.log(`Found image for ${quest.questKey} ${state}:`, fullPath);
        } else {
          console.log(`Missing image for ${quest.questKey} ${state}:`, fullPath);
        }
      }
    }
  }
  
  console.log('Extracted quest images:', questImages);
  
  return {
    questlineData,
    backgroundImage,
    questImages
  };
} 