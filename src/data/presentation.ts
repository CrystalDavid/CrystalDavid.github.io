export type EducationVariant = 'timeline' | 'classic';
export type NavigationVariant = 'buttons' | 'classic';

// Change either value to 'classic' to restore that layout independently.
export const presentation: {
  education: EducationVariant;
  navigation: NavigationVariant;
} = {
  education: 'timeline',
  navigation: 'buttons',
};
