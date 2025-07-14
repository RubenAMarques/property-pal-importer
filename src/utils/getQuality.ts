interface ScoreData {
  photos_divisions?: boolean;
  duplicates?: boolean;
  photo_quality?: boolean;
  location_ok?: boolean;
  description_ok?: boolean;
  base_info_ok?: boolean;
}

interface ParsedQuality {
  photosDivisionsOk: boolean;
  noDuplicatesOk: boolean;
  photo_quality: boolean;
  location_ok: boolean;
  description_ok: boolean;
  base_info_ok: boolean;
}

/**
 * Normalizes the score_json data and handles inverted logic for specific fields
 * - photos_divisions: GREEN when false (no problematic divisions)
 * - duplicates: GREEN when false (no duplicates found)
 * - Other fields: GREEN when true (standard logic)
 */
export function parseQuality(scoreJson: ScoreData | null): ParsedQuality {
  if (!scoreJson) {
    return {
      photosDivisionsOk: false,
      noDuplicatesOk: false,
      photo_quality: false,
      location_ok: false,
      description_ok: false,
      base_info_ok: false,
    };
  }

  return {
    // Inverted logic: GREEN when false
    photosDivisionsOk: !scoreJson.photos_divisions,
    noDuplicatesOk: !scoreJson.duplicates,
    
    // Standard logic: GREEN when true
    photo_quality: scoreJson.photo_quality === true,
    location_ok: scoreJson.location_ok === true,
    description_ok: scoreJson.description_ok === true,
    base_info_ok: scoreJson.base_info_ok === true,
  };
}