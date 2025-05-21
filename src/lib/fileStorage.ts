import { FEATURES } from './config';

// Define the storage key for the file map
const FILE_MAP_KEY = 'sai_music_files';

// Interface for file metadata
interface FileMetadata {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  createdAt: string;
}

// Get the file map from local storage
const getFileMap = (): Record<string, FileMetadata> => {
  const map = localStorage.getItem(FILE_MAP_KEY);
  return map ? JSON.parse(map) : {};
};

// Save the file map to local storage
const saveFileMap = (map: Record<string, FileMetadata>) => {
  localStorage.setItem(FILE_MAP_KEY, JSON.stringify(map));
};

// Convert a File object to a data URL
const fileToDataUrl = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Store a file and return its ID
export const storeFile = async (file: File): Promise<string> => {
  try {
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const dataUrl = await fileToDataUrl(file);
    
    const metadata: FileMetadata = {
      id: fileId,
      name: file.name,
      type: file.type,
      size: file.size,
      dataUrl,
      createdAt: new Date().toISOString()
    };
    
    const fileMap = getFileMap();
    fileMap[fileId] = metadata;
    saveFileMap(fileMap);
    
    return fileId;
  } catch (error) {
    console.error('Error storing file:', error);
    throw new Error('Failed to store file');
  }
};

// Get a file's data URL by its ID
export const getFileUrl = (fileId: string): string | null => {
  const fileMap = getFileMap();
  const metadata = fileMap[fileId];
  return metadata ? metadata.dataUrl : null;
};

// Delete a file by its ID
export const deleteFile = (fileId: string): boolean => {
  try {
    const fileMap = getFileMap();
    if (fileMap[fileId]) {
      delete fileMap[fileId];
      saveFileMap(fileMap);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Clean up old files (optional, can be called periodically)
export const cleanupOldFiles = (maxAgeInDays: number = 30) => {
  try {
    const fileMap = getFileMap();
    const now = new Date();
    const maxAge = maxAgeInDays * 24 * 60 * 60 * 1000;
    
    Object.entries(fileMap).forEach(([id, metadata]) => {
      const age = now.getTime() - new Date(metadata.createdAt).getTime();
      if (age > maxAge) {
        delete fileMap[id];
      }
    });
    
    saveFileMap(fileMap);
  } catch (error) {
    console.error('Error cleaning up old files:', error);
  }
}; 