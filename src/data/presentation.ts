export type EducationVariant = 'timeline' | 'classic';
export type NavigationVariant = 'buttons' | 'classic';
export type HomeAlignment = 'avatar' | 'classic';

// Select each option independently; classic layouts and alignment remain available.
export const presentation: {
  education: EducationVariant;
  navigation: NavigationVariant;
  homeAlignment: HomeAlignment;
} = {
  education: 'timeline',
  navigation: 'classic',
  homeAlignment: 'avatar',
};
