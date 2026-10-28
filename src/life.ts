// The month: `tick` runs every system in a fixed order, each on its own random stream. The world's rules live with their systems
// (body.ts, work.ts, social.ts, romance.ts, stress.ts, money.ts, migration.ts, yearly.ts); everything people *do* in answer to a
// situation goes through the grammar.

import { type World, OFF, use, setStreams, live, year } from './world';
import { situationsTick, spotlightTick } from './situations';
import { scoreRecent } from './witness';
import { threadsTick } from './threads';
import { groupTick } from './group';
import { dramaTick } from './drama';
import { projectsTick } from './projects';
import { personaTick } from './persona';
import { loveTick } from './love';
import { timeTick } from './time';
import { coarseYear } from './coarse';
import { bodyTick, mortality } from './body';
import { leaveTown, migrationTick } from './migration';
import { moneyTick, wantTick } from './money';
import { romanceTick, split, familyTick } from './romance';
import { socialTick } from './social';
import { stressTick } from './stress';
import { workTick, skillTick } from './work';
import { yearly } from './yearly';
import { aftermathTick } from './aftermath';
import { feelingsTick } from './feelings';
import { sidesTick } from './sides';

export function tick(w: World) {
  w.t++;
  // A month's chance is its own (round 25b): every system's stream is drawn afresh each month, so whatever shifts one shifts it only
  // until the month ends.
  // (a test may give the past other dice from the same founding: pastSalt, set only by scale tests)
  const salt = (w as any).pastSalt != null ? [(w as any).pastSalt] : [];
  setStreams(w, ...(w.t <= w.startPresent ? [w.seed, 'past', ...salt] : [w.seed, w.runSeed, 'run']), w.t);
  w.hooks.leaveTown = leaveTown;
  (w.hooks as any).split = split;
  use(w, 'body');
  for (const p of live(w)) bodyTick(w, p);
  for (const p of live(w)) if (mortality(w, p)) continue;
  use(w, 'work');
  workTick(w);
  use(w, 'social');
  socialTick(w);
  use(w, 'situations');
  situationsTick(w);
  spotlightTick(w);
  use(w, 'threads');
  threadsTick(w);
  use(w, 'time');
  timeTick(w);
  use(w, 'groups');
  if (!OFF.has('groups')) groupTick(w);
  use(w, 'drama');
  dramaTick(w);
  use(w, 'projects');
  projectsTick(w);
  use(w, 'persona');
  personaTick(w);
  use(w, 'love');
  loveTick(w);
  use(w, 'romance');
  romanceTick(w);
  use(w, 'family');
  familyTick(w);
  use(w, 'stress');
  for (const p of live(w)) stressTick(w, p);
  use(w, 'money');
  for (const p of live(w)) {
    moneyTick(w, p);
    skillTick(w, p);
    wantTick(w, p);
  }
  use(w, 'migration');
  migrationTick(w);
  use(w, 'yearly');
  if (w.t % 12 === 0) yearly(w);
  if (w.t % 12 === 0) coarseYear(w); // a city's background: one coarse step a year, on its own dice (nothing happens here in a town)
  use(w, 'misc');
  scoreRecent(w);
  aftermathTick(w); // what this month's blows will change (round 34): queued for next month's situations; no dice
  feelingsTick(w); // feelings fade, unless their cause renews them (round 44); no dice
  sidesTick(w); // this month's rifts: who is close to both decides next month (round 46); no dice
}
