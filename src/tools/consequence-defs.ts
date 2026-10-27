// What the consequence map counts: a weighty event, a turn, and the part of the model an event comes from. Shared by the map
// (consequences.ts) and the density diagnostic (diag/density.ts), so both count the same things.
import { peekBond, TEXTURE, type Event, type World } from '../world';
export const TURNS = new Set([
  'hired',
  'dismiss',
  'walkout',
  'quitpride',
  'promoted',
  'retired',
  'stepdown',
  'left',
  'home',
  'dating',
  'married',
  'divorce',
  'split',
  'friends',
  'madeup',
  'cooled',
  'mended',
  'group:formed',
  'group:joined',
  'group:left',
  'group:split',
  'numb',
  'sober',
  'bought',
  'setback',
  'takenup',
  'gaveup',
  'want:achieved',
  'want:failed',
  'want:abandoned',
  'regret',
  'rivalry',
  'grudge',
  'peace',
  'opened',
  'plan:failed',
  'council:no',
  'council:yes',
  'scheme:found',
  'born',
]);
export const weighty = (e: Event) => e.w >= 0.8 && !TEXTURE.has(e.type);
// A coarse label for which part of the model an event comes from (by its decision's situation, else its type).
export function system(e: Event) {
  const tr = String((e.decision as any)?.trigger ?? '').replace(/:.*$/, '');
  const ty = e.type;
  if (tr === 'row' || tr === 'row-answer' || ty === 'care' || ty === 'couple:pattern' || ['dating', 'married', 'divorce', 'split'].includes(ty))
    return 'couples';
  if (/^(contest|rival|grudge|scheme|peace|passed|promoted|stepdown|undermined)/.test(tr || ty) || ['rivalry', 'rivals', 'grudge'].includes(ty))
    return 'drama';
  if (/^(plan|pitch|backing|council|opened|night|turneddown)/.test(tr || ty)) return 'plans';
  if (/^group/.test(tr || ty) || ['performed', 'authorship', 'spark'].includes(ty)) return 'groups';
  if (/^thread/.test(ty) || tr === 'strain') return 'threads';
  if (ty === 'humour' || ty === 'regret') return 'persona';
  if (['friends', 'madeup', 'cooled', 'mended', 'dislike', 'misread', 'reachout'].includes(ty) || tr === 'reachout') return 'friendship';
  if (/^(want|pursuit|takenup|gaveup|gotgood|goforit|pushon|setback|bought)/.test(ty) || tr === 'a want') return 'wants';
  if (
    ['hired', 'dismiss', 'walkout', 'quitpride', 'retired', 'deadline', 'risk', 'judgement', 'criticised'].includes(ty) ||
    ['deadline', 'risk', 'judgement', 'criticised'].includes(tr)
  )
    return 'work';
  if (['left', 'home', 'arrived', 'stayed', 'follow', 'unfollow'].includes(ty)) return 'home';
  if (['death', 'born', 'accident', 'loss'].includes(ty) || tr === 'loss' || tr === 'support') return 'life';
  return tr ? `situation:${tr}` : 'other';
}
// What a witness knows of an event, two tiers, both read at the end of a run (the record's "who knows it" grows as talk spreads):
//   known       the witness is in the event's knownBy, or is one of its people (as the app and the witness's scores count it);
//   could know  known, or the event is public, or someone the witness knows (a bond from the witness with familiarity > 0.25, the
//               engine's own line in witness.ts `knows`) is one of its people or in its knownBy: one question away.
export function knowable(w: World, wit: number) {
  const close = (id: number) => id !== wit && (peekBond(w, wit, id)?.fam ?? 0) > 0.25;
  const known = (e: Event) => e.knownBy.has(wit) || e.who.includes(wit);
  const could = (e: Event) => known(e) || e.vis === 'public' || e.who.some(close) || [...e.knownBy.keys()].some(close);
  return { known, could };
}
