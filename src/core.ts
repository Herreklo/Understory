// Core data: what every world shares. No setting-specific content lives here.

export type Dim = 'H' | 'E' | 'X' | 'A' | 'C' | 'O';

export interface Facet {
  id: string;
  dim: Dim | 'I'; // I = interstitial (Altruism)
  name: string;
  high: string; // one-phrase description of a high scorer
  low: string;
  hiTell: string; // a tell a manager might notice, at the high end
  loTell: string;
}

export const DIMS: Record<Dim, string> = {
  H: 'Honesty–Humility',
  E: 'Emotionality',
  X: 'Extraversion',
  A: 'Agreeableness',
  C: 'Conscientiousness',
  O: 'Openness',
};

export const FACETS: Facet[] = [
  {
    id: 'sincerity',
    dim: 'H',
    name: 'Sincerity',
    high: "genuine, won't flatter",
    low: 'flatters and manoeuvres',
    hiTell: 'says the awkward thing plainly',
    loTell: 'tells people what they want to hear',
  },
  {
    id: 'fairness',
    dim: 'H',
    name: 'Fairness',
    high: "won't cheat or steal",
    low: 'bends rules when nobody looks',
    hiTell: 'splits things exactly even',
    loTell: 'rounds things in their own favour',
  },
  {
    id: 'greedAvoidance',
    dim: 'H',
    name: 'Greed avoidance',
    high: 'indifferent to money and status',
    low: 'wants wealth and the best of everything',
    hiTell: 'barely asks what it pays',
    loTell: 'asks what it pays before anything else',
  },
  {
    id: 'modesty',
    dim: 'H',
    name: 'Modesty',
    high: 'sees themselves as ordinary',
    low: 'feels entitled to more',
    hiTell: 'deflects credit',
    loTell: 'counts who got credit',
  },
  {
    id: 'fearfulness',
    dim: 'E',
    name: 'Fearfulness',
    high: 'avoids physical danger',
    low: 'unbothered by danger',
    hiTell: 'hangs back when it gets physical',
    loTell: 'goes first through the door',
  },
  {
    id: 'anxiety',
    dim: 'E',
    name: 'Anxiety',
    high: 'worries under pressure',
    low: 'calm under pressure',
    hiTell: 'goes quiet and tense before big moments',
    loTell: 'jokes right before a big moment',
  },
  {
    id: 'dependence',
    dim: 'E',
    name: 'Dependence',
    high: 'seeks support from others',
    low: 'copes alone',
    hiTell: 'comes to you when something is wrong',
    loTell: 'mentions problems only once they are over',
  },
  {
    id: 'sentimentality',
    dim: 'E',
    name: 'Sentimentality',
    high: 'forms deep attachments',
    low: 'detached, moves on easily',
    hiTell: 'keeps old things, mentions old friends',
    loTell: 'rarely looks back',
  },
  {
    id: 'socialSelfEsteem',
    dim: 'X',
    name: 'Social self-esteem',
    high: 'at ease with who they are',
    low: 'doubts their own worth',
    hiTell: 'takes a compliment simply',
    loTell: 'brushes compliments off',
  },
  {
    id: 'socialBoldness',
    dim: 'X',
    name: 'Social boldness',
    high: 'at ease in front of people',
    low: 'shy in groups',
    hiTell: 'speaks first in a room',
    loTell: 'speaks when asked',
  },
  {
    id: 'sociability',
    dim: 'X',
    name: 'Sociability',
    high: 'enjoys company',
    low: 'prefers to be alone',
    hiTell: 'is always the last to leave',
    loTell: 'slips away early',
  },
  {
    id: 'liveliness',
    dim: 'X',
    name: 'Liveliness',
    high: 'energetic and upbeat',
    low: 'subdued',
    hiTell: 'lifts a room',
    loTell: 'rarely shows it when pleased',
  },
  {
    id: 'forgiveness',
    dim: 'A',
    name: 'Forgiveness',
    high: 'lets go of wrongs',
    low: 'holds grudges',
    hiTell: 'is back to normal the next day',
    loTell: 'brings up old slights',
  },
  {
    id: 'gentleness',
    dim: 'A',
    name: 'Gentleness',
    high: 'mild in judging others',
    low: 'harsh in judgement',
    hiTell: 'finds something kind to say',
    loTell: 'says exactly what was wrong',
  },
  {
    id: 'flexibility',
    dim: 'A',
    name: 'Flexibility',
    high: 'compromises easily',
    low: 'digs in',
    hiTell: 'goes along with the group',
    loTell: 'argues a point to the end',
  },
  {
    id: 'patience',
    dim: 'A',
    name: 'Patience',
    high: 'slow to anger',
    low: 'short fuse',
    hiTell: 'stays level when provoked',
    loTell: 'snaps at small things',
  },
  {
    id: 'organisation',
    dim: 'C',
    name: 'Organisation',
    high: 'orderly, plans ahead',
    low: 'disorganised',
    hiTell: 'arrives with a list',
    loTell: 'arrives late, looking for something',
  },
  {
    id: 'diligence',
    dim: 'C',
    name: 'Diligence',
    high: 'works hard',
    low: 'does the minimum',
    hiTell: 'is still at it when others have stopped',
    loTell: 'is first to call it a day',
  },
  {
    id: 'perfectionism',
    dim: 'C',
    name: 'Perfectionism',
    high: 'thorough to a fault',
    low: 'good enough is good enough',
    hiTell: 'redoes what was already fine',
    loTell: 'ships it rough',
  },
  {
    id: 'prudence',
    dim: 'C',
    name: 'Prudence',
    high: 'thinks before acting',
    low: 'acts on impulse',
    hiTell: 'asks for a night to think',
    loTell: 'decides on the spot',
  },
  {
    id: 'aesthetic',
    dim: 'O',
    name: 'Aesthetic appreciation',
    high: 'moved by beauty',
    low: 'indifferent to art',
    hiTell: 'stops to look at things',
    loTell: 'walks past it',
  },
  {
    id: 'inquisitiveness',
    dim: 'O',
    name: 'Inquisitiveness',
    high: 'curious about everything',
    low: 'content with the familiar',
    hiTell: 'asks how things work',
    loTell: 'rarely asks questions',
  },
  {
    id: 'creativity',
    dim: 'O',
    name: 'Creativity',
    high: 'full of original ideas',
    low: 'prefers proven ways',
    hiTell: 'suggests the odd angle',
    loTell: 'does it the usual way',
  },
  {
    id: 'unconventionality',
    dim: 'O',
    name: 'Unconventionality',
    high: 'drawn to the strange',
    low: 'conventional',
    hiTell: 'dresses and talks a little differently',
    loTell: 'fits in anywhere',
  },
  {
    id: 'altruism',
    dim: 'I',
    name: 'Altruism',
    high: 'helps at own cost',
    low: 'looks after themselves',
    hiTell: 'is first to offer help',
    loTell: 'helps when asked, if convenient',
  },
];

export const FACET_BY_ID = Object.fromEntries(FACETS.map(f => [f.id, f])) as Record<string, Facet>;

// Rough correlations between the six dimensions, from HEXACO research (small, mostly positive
// between H/A/C and small negative with E for X). Used to draw correlated dimension scores.
export const DIM_CORR: Record<Dim, Partial<Record<Dim, number>>> = {
  H: { A: 0.25, C: 0.15, E: 0.1 },
  E: { X: -0.15, A: -0.05 },
  X: { C: 0.1, O: 0.15 },
  A: { C: 0.1 },
  C: { O: 0.05 },
  O: {},
};

export interface Value {
  id: string;
  name: string;
  opposes: string[];
  from: Partial<Record<Dim, number>>;
}

// Schwartz circle, ten values; `from` = how traits lean into each value.
export const VALUES: Value[] = [
  { id: 'freedom', name: 'Freedom', opposes: ['fittingIn', 'tradition'], from: { O: 0.5, A: -0.2 } },
  { id: 'thrill', name: 'Thrill', opposes: ['security'], from: { O: 0.4, E: -0.4, X: 0.2 } },
  { id: 'pleasure', name: 'Pleasure', opposes: ['fittingIn', 'tradition'], from: { X: 0.4, C: -0.3 } },
  { id: 'success', name: 'Success', opposes: ['lovedOnes', 'fairness'], from: { C: 0.4, X: 0.3, H: -0.2 } },
  { id: 'status', name: 'Status', opposes: ['fairness', 'lovedOnes'], from: { H: -0.6, X: 0.2 } },
  { id: 'security', name: 'Security', opposes: ['thrill', 'freedom'], from: { E: 0.4, C: 0.3, O: -0.3 } },
  { id: 'fittingIn', name: 'Fitting in', opposes: ['freedom', 'pleasure'], from: { A: 0.3, C: 0.3, O: -0.3 } },
  { id: 'tradition', name: 'Tradition', opposes: ['freedom', 'thrill'], from: { O: -0.5, C: 0.2, E: 0.2 } },
  { id: 'lovedOnes', name: 'Loved ones', opposes: ['success', 'status'], from: { A: 0.4, E: 0.3, H: 0.2 } },
  { id: 'fairness', name: 'Fairness', opposes: ['status', 'success'], from: { H: 0.6, A: 0.2, O: 0.2 } },
];

export interface Aptitude {
  id: string;
  name: string;
  peak: number;
  decline: number;
} // peak age, decline per year after
export const APTITUDES: Aptitude[] = [
  { id: 'reasoning', name: 'Reasoning', peak: 22, decline: 0.012 },
  { id: 'memory', name: 'Memory', peak: 30, decline: 0.01 },
  { id: 'language', name: 'Language', peak: 55, decline: 0.006 },
  { id: 'socialInsight', name: 'Social insight', peak: 48, decline: 0.006 },
  { id: 'presence', name: 'Presence', peak: 45, decline: 0.004 },
  { id: 'dexterity', name: 'Dexterity', peak: 27, decline: 0.012 },
  { id: 'ear', name: 'Musical ear', peak: 25, decline: 0.008 },
  { id: 'visual', name: 'Visual sense', peak: 35, decline: 0.006 },
  { id: 'physique', name: 'Physique', peak: 26, decline: 0.018 },
];

// Tensions: a pair pulled apart at generation, with the story shape it tends to produce.
export interface Tension {
  id: string;
  a: [string, number];
  b: [string, number];
  label: string;
}
export const TENSIONS: Tension[] = [
  { id: 'rooted-restless', a: ['sentimentality', 1], b: ['inquisitiveness', 1], label: 'wants to go, and wants to stay' },
  { id: 'bold-anxious', a: ['socialBoldness', 1], b: ['anxiety', 1], label: 'craves the spotlight and dreads it' },
  { id: 'entitled-insecure', a: ['modesty', -1], b: ['socialSelfEsteem', -1], label: 'feels owed, and feels worthless' },
  { id: 'exacting-idle', a: ['perfectionism', 1], b: ['diligence', -1], label: 'high standards, low effort' },
  { id: 'giving-reckless', a: ['altruism', 1], b: ['prudence', -1], label: 'gives away what they need' },
  { id: 'sociable-harsh', a: ['sociability', 1], b: ['gentleness', -1], label: 'loves company, and cuts people down' },
  { id: 'honest-harsh', a: ['sincerity', 1], b: ['gentleness', -1], label: 'honest to the point of cruelty' },
  { id: 'curious-cautious', a: ['inquisitiveness', 1], b: ['fearfulness', 1], label: 'curious about everything, afraid of most of it' },
  { id: 'proud-dependent', a: ['modesty', -1], b: ['dependence', 1], label: "needs people, and can't admit it" },
  { id: 'driven-detached', a: ['diligence', 1], b: ['sentimentality', -1], label: 'works like a machine, and feels like one' },
];

// Formative pasts: each explains a signature trait. `shift` = which facet, which direction.
export interface Past {
  facet: string;
  dir: 1 | -1;
  text: string;
  age: [number, number];
}
export const PASTS: Past[] = [
  { facet: 'sentimentality', dir: 1, text: 'raised by grandparents who told the same stories every night', age: [4, 12] },
  { facet: 'sentimentality', dir: -1, text: 'moved house six times before turning twelve', age: [3, 12] },
  { facet: 'anxiety', dir: 1, text: 'grew up in a house where money was always about to run out', age: [5, 14] },
  { facet: 'anxiety', dir: -1, text: 'nearly drowned at nine and came up laughing', age: [8, 10] },
  { facet: 'fearfulness', dir: 1, text: 'saw a close friend badly hurt as a child', age: [6, 13] },
  { facet: 'fearfulness', dir: -1, text: 'spent childhood summers doing dangerous things unsupervised', age: [7, 14] },
  { facet: 'dependence', dir: -1, text: 'learned early that nobody was coming to help', age: [5, 12] },
  { facet: 'dependence', dir: 1, text: 'the youngest of five, always looked after', age: [2, 10] },
  { facet: 'modesty', dir: -1, text: 'told from the start that they were special', age: [4, 12] },
  { facet: 'modesty', dir: 1, text: 'raised in a family where boasting was the one unforgivable sin', age: [4, 14] },
  { facet: 'socialSelfEsteem', dir: -1, text: 'a parent who was never satisfied', age: [5, 16] },
  { facet: 'socialSelfEsteem', dir: 1, text: 'the kind of child adults listened to', age: [6, 14] },
  { facet: 'socialBoldness', dir: 1, text: 'put on stage at seven and never got off', age: [6, 9] },
  { facet: 'socialBoldness', dir: -1, text: 'laughed at in front of the class, once, and never forgot it', age: [8, 13] },
  { facet: 'sociability', dir: -1, text: 'an only child on a farm with no neighbours', age: [3, 12] },
  { facet: 'sociability', dir: 1, text: 'grew up in a house that was never empty', age: [3, 14] },
  { facet: 'forgiveness', dir: -1, text: 'a parent who left and never explained', age: [6, 14] },
  { facet: 'forgiveness', dir: 1, text: 'watched a grudge eat their father alive', age: [10, 17] },
  { facet: 'gentleness', dir: -1, text: 'a household where criticism was the only language', age: [5, 15] },
  { facet: 'patience', dir: -1, text: 'a father with a temper, and a temper learned from him', age: [4, 14] },
  { facet: 'patience', dir: 1, text: 'cared for a sick sibling for years', age: [10, 17] },
  { facet: 'organisation', dir: 1, text: 'ran the household from age twelve', age: [11, 16] },
  { facet: 'organisation', dir: -1, text: 'parents who never kept a plan for longer than a week', age: [4, 14] },
  { facet: 'diligence', dir: 1, text: 'worked in the family business from age nine', age: [8, 15] },
  { facet: 'diligence', dir: -1, text: "things always came easily, until they didn't", age: [8, 16] },
  { facet: 'perfectionism', dir: 1, text: 'a teacher who said "again" until it was right', age: [8, 15] },
  { facet: 'prudence', dir: -1, text: 'the one who always jumped first', age: [6, 14] },
  { facet: 'prudence', dir: 1, text: 'saw what one bad decision did to an older brother', age: [10, 17] },
  { facet: 'sincerity', dir: 1, text: 'caught in a lie at eight and shamed for it in front of everyone', age: [7, 10] },
  { facet: 'sincerity', dir: -1, text: 'learned young that charm got you out of anything', age: [6, 14] },
  { facet: 'fairness', dir: -1, text: 'grew up where everyone took a little on the side', age: [8, 16] },
  { facet: 'fairness', dir: 1, text: 'cheated out of something that mattered, and never did it to anyone', age: [9, 16] },
  { facet: 'greedAvoidance', dir: -1, text: 'the poor kid at a rich school', age: [10, 16] },
  { facet: 'greedAvoidance', dir: 1, text: 'raised to think talking about money was vulgar', age: [5, 14] },
  { facet: 'inquisitiveness', dir: 1, text: 'a library card at five and nobody checking what they read', age: [5, 12] },
  { facet: 'inquisitiveness', dir: -1, text: 'a town where nobody ever left, and nobody asked why', age: [5, 16] },
  { facet: 'creativity', dir: 1, text: 'a parent who made things up at the dinner table every night', age: [4, 12] },
  { facet: 'aesthetic', dir: 1, text: 'a mother who played records all day', age: [3, 12] },
  { facet: 'unconventionality', dir: 1, text: 'the odd one out in a conventional family, and proud of it', age: [8, 16] },
  { facet: 'unconventionality', dir: -1, text: 'raised to believe there was a right way to do everything', age: [4, 14] },
  { facet: 'altruism', dir: 1, text: 'a grandmother who fed half the street', age: [4, 12] },
  { facet: 'altruism', dir: -1, text: 'learned early that generosity got taken advantage of', age: [7, 15] },
  { facet: 'liveliness', dir: -1, text: 'a quiet house after a death nobody talked about', age: [6, 14] },
  { facet: 'liveliness', dir: 1, text: 'the family clown, and it worked', age: [5, 12] },
  { facet: 'flexibility', dir: -1, text: 'the only way to be heard at home was to never back down', age: [6, 15] },
];
