import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_KEY = '@find_scholar_saved';

export type SavedScholarship = {
  _id: string;
  name: string;
  provider?: string;
  description?: string;
  providerType?: string;
  educationLevels?: string[];
  fieldsOfStudy?: string[];
  eligibility?: string[];
  benefits?: string[];
  documentsRequired?: string[];
  restrictions?: string[];
  academicCriteria?: string;
  incomeCriteria?: string;
  officialLink?: string;
  lastVerified?: string;
};

export async function getSavedScholarships(): Promise<SavedScholarship[]> {
  try {
    const stored = await AsyncStorage.getItem(SAVED_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error loading saved scholarships:', error);
    return [];
  }
}

export async function isScholarshipSaved(
  scholarshipId: string,
): Promise<boolean> {
  const saved = await getSavedScholarships();

  return saved.some((scholarship) => scholarship._id === scholarshipId);
}

export async function saveScholarship(
  scholarship: SavedScholarship,
): Promise<void> {
  try {
    const saved = await getSavedScholarships();

    const alreadySaved = saved.some(
      (item) => item._id === scholarship._id,
    );

    if (!alreadySaved) {
      const updated = [...saved, scholarship];

      await AsyncStorage.setItem(
        SAVED_KEY,
        JSON.stringify(updated),
      );
    }
  } catch (error) {
    console.error('Error saving scholarship:', error);
  }
}

export async function removeSavedScholarship(
  scholarshipId: string,
): Promise<void> {
  try {
    const saved = await getSavedScholarships();

    const updated = saved.filter(
      (scholarship) => scholarship._id !== scholarshipId,
    );

    await AsyncStorage.setItem(
      SAVED_KEY,
      JSON.stringify(updated),
    );
  } catch (error) {
    console.error('Error removing saved scholarship:', error);
  }
}

export async function toggleSavedScholarship(
  scholarship: SavedScholarship,
): Promise<boolean> {
    console.log('TOGGLE SAVE ID:', scholarship._id);
    
  const saved = await getSavedScholarships();

  const alreadySaved = saved.some(
    (item) => item._id === scholarship._id,
  );

  if (alreadySaved) {
    await removeSavedScholarship(scholarship._id);
    return false;
  }

  await saveScholarship(scholarship);
  return true;
}