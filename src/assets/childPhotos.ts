import childPhoto1 from "@/assets/child-photo.jpg";
import childPhoto2 from "@/assets/child-photo-2.jpg";

// Map of child names to their photos for mock data
const childPhotoMap: Record<string, string> = {
  "Emma Wilson": childPhoto2,
  "Emma Johnson": childPhoto2,
  "Ava Martinez": childPhoto2,
  "Sofia Garcia": childPhoto2,
  "Liam Johnson": childPhoto1,
  "Liam Wilson": childPhoto1,
  "Noah Brown": childPhoto1,
  "Oliver Davis": childPhoto1,
  "Sophia": childPhoto2,
  "Sophia Johnson": childPhoto2,
};

export const getChildPhoto = (name: string): string | undefined => {
  // Try exact match first, then match by first name
  if (childPhotoMap[name]) return childPhotoMap[name];
  const firstName = name.split(" ")[0];
  const match = Object.keys(childPhotoMap).find(k => k.startsWith(firstName));
  return match ? childPhotoMap[match] : childPhoto1;
};

export const defaultChildPhoto = childPhoto1;
export { childPhoto1, childPhoto2 };
