// Situation features and the wiring table: which facets a feature activates.
// If-then signatures key off these same features.

export type Feature =
  | 'public' | 'private' | 'watched' | 'authority' | 'money' | 'standing' | 'safety' | 'love' | 'freedom'
  | 'danger' | 'need' | 'pressure' | 'family' | 'challenged' | 'tired' | 'stranger' | 'friend';

export const FEATURE_WORDS: Record<Feature, string> = {
  public: 'in front of others', private: 'in private', watched: 'being watched', authority: 'with authority present', money: 'money at stake',
  standing: 'standing at stake', safety: 'safety at stake', love: 'love at stake', freedom: 'freedom at stake', danger: 'physical danger',
  need: 'someone in need', pressure: 'under time pressure', family: 'with family', challenged: 'their work questioned', tired: 'worn out',
  stranger: 'with a stranger', friend: 'with a friend',
};

// Which facets a feature calls on, and in which direction they push a person to act.
// Positive weight: the facet favours acting (responding, taking, going). Used to generate considerations.
export const ACTIVATION: Partial<Record<Feature, Partial<Record<string, number>>>> = {
  public: { socialBoldness: 1, anxiety: -0.8, modesty: -0.4 },
  watched: { anxiety: -0.8, socialSelfEsteem: 0.5 },
  authority: { socialBoldness: 0.8, flexibility: -0.5 },
  money: { greedAvoidance: -1, fairness: -0.8, prudence: -0.4 },
  standing: { modesty: -1, socialSelfEsteem: 0.4 },
  safety: { fearfulness: -1, prudence: -0.6 },
  danger: { fearfulness: -1.2, prudence: -0.5 },
  need: { altruism: 1, gentleness: 0.5 },
  pressure: { organisation: 0.6, anxiety: -0.6 },
  family: { sentimentality: 0.8, lovedOnes: 0.6 },
  challenged: { patience: -1, modesty: -0.8, flexibility: -0.5 },
  tired: { patience: -0.8 },
  freedom: { inquisitiveness: 0.8, unconventionality: 0.5 },
  love: { sentimentality: 0.8, dependence: 0.5 },
};

// If-then signature templates: a feature and the facet it shifts, with words for the player.
export interface IfThenTemplate { feature: Feature; facet: string; words: (dir: 1 | -1) => string }
export const IFTHEN_TEMPLATES: IfThenTemplate[] = [
  { feature: 'challenged', facet: 'patience', words: d => d > 0 ? 'oddly calm when their work is questioned' : 'snaps the moment their work is questioned' },
  { feature: 'challenged', facet: 'flexibility', words: d => d > 0 ? 'gives way surprisingly easily when challenged' : 'digs in hard when challenged' },
  { feature: 'public', facet: 'socialBoldness', words: d => d > 0 ? 'comes alive in front of a crowd' : 'shrinks in front of a crowd' },
  { feature: 'public', facet: 'gentleness', words: d => d > 0 ? 'kind in company, whatever they say in private' : 'cruel for an audience' },
  { feature: 'watched', facet: 'anxiety', words: d => d > 0 ? 'falls apart when watched' : 'steadiest when all eyes are on them' },
  { feature: 'authority', facet: 'sincerity', words: d => d > 0 ? 'bluntest with the boss, of all people' : 'turns into a flatterer around anyone with power' },
  { feature: 'authority', facet: 'socialBoldness', words: d => d > 0 ? 'stands up to the boss' : 'goes quiet around the boss' },
  { feature: 'money', facet: 'fairness', words: d => d > 0 ? 'scrupulous about money, whatever else' : 'honest about everything except money' },
  { feature: 'money', facet: 'altruism', words: d => d > 0 ? 'generous with money, if nothing else' : 'helps with anything but money' },
  { feature: 'family', facet: 'patience', words: d => d > 0 ? 'endlessly patient with family' : 'short with family in a way they never are with anyone else' },
  { feature: 'family', facet: 'sincerity', words: d => d > 0 ? 'can only be honest with family' : 'lies to family more easily than to strangers' },
  { feature: 'need', facet: 'altruism', words: d => d > 0 ? 'the first to help when someone is really in trouble' : 'disappears when someone really needs them' },
  { feature: 'danger', facet: 'fearfulness', words: d => d > 0 ? 'bold about everything except physical danger' : 'fearless only in physical danger' },
  { feature: 'tired', facet: 'patience', words: d => d > 0 ? 'patient even when exhausted' : 'a different person when tired' },
  { feature: 'pressure', facet: 'organisation', words: d => d > 0 ? 'best under a deadline' : 'falls apart under a deadline' },
  { feature: 'standing', facet: 'modesty', words: d => d > 0 ? 'modest except when status is on the line' : 'wants the credit, whatever they say' },
  { feature: 'stranger', facet: 'sociability', words: d => d > 0 ? 'warmer with strangers than with friends' : 'closed with strangers, open with friends' },
  { feature: 'friend', facet: 'forgiveness', words: d => d > 0 ? 'forgives friends anything' : 'hardest on the people closest to them' },
];
