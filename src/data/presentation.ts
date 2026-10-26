export type EducationVariant = 'timeline' | 'classic';
export type NavigationVariant = 'buttons' | 'classic';

// Select each layout independently; both variants remain available.
export const presentation: {
  education: EducationVariant;
  navigation: NavigationVariant;
} = {
  education: 'timeline',
  navigation: 'classic',
};
