import { MintConfig } from "../../interfaces/launchpad/MintConfig";
import { PUMP_IPFS_URL } from "../consts";

export async function createTokenMetadata(metadata: MintConfig) {
  if (!(metadata.image instanceof Blob)) {
    throw new Error('File must be a Blob or File object');
  }

  let formData = new FormData();
  formData.append("file", metadata.image, 'image.png');
  formData.append("name", metadata.name);
  formData.append("symbol", metadata.symbol);
  formData.append("description", metadata.description);
  formData.append("twitter", metadata.twitter || "");
  formData.append("telegram", metadata.telegram || "");
  formData.append("website", metadata.website || "");
  formData.append("showName", "true");

  try {
    const request = await fetch(PUMP_IPFS_URL, {
      method: "POST",
      headers: {
          'Accept': 'application/json',
      },
      body: formData,
      credentials: 'same-origin'
    });

    if (request.status === 500) {
        const errorText = await request.text();
        throw new Error(`Server error (500): ${errorText || 'No error details available'}`);
    }

    if (!request.ok) {
      throw new Error(`HTTP error! status: ${request.status}`);
    }

    const responseText = await request.text();
    if (!responseText) {
      throw new Error('Empty response received from server');
    }

    try {
      return JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Invalid JSON response: ${responseText}`);
    }
  } catch (error) {
    console.error('Error in createTokenMetadata:', error);
    throw error;
  }
}