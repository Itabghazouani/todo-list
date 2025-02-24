// bg-green-700
// bg-yellow-500
// bg-blue-500
// bg-orange-500
// bg-purple-500
// bg-pink-500
// bg-gray-500

export const CATEGORIES = {
  SPORT: 'Sport',
  WORK: 'Travail',
  ADMINISTRATIVE: 'Administratif',
  HOME: 'Maison',
  HOBBIES: 'Hobbies',
  SHOPPING: 'Shopping',
  OTHER: 'Autre',
} as const;

export const CATEGORY_STYLES: Record<string, string> = {
  SPORT: 'bg-green-700 text-white',
  WORK: 'bg-yellow-500 text-white',
  ADMINISTRATIVE: 'bg-blue-500 text-white',
  HOME: 'bg-orange-500 text-white',
  HOBBIES: 'bg-purple-500 text-white',
  SHOPPING: 'bg-pink-500 text-white',
  OTHER: 'bg-gray-500 text-white',
} as const;
