export const urlToFile = async (url: string, filename: string): Promise<File | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  } catch (error) {
    console.warn('Failed to convert URL to file:', error);
    return null;
  }
};