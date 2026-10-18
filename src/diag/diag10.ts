// For lottery events: which causes were unknown, by kind and key.
import { buildWorld, runYears } from '../build';
import { pickWitness, scoreAll } from '../witness';
import { belief, P } from '../world';
const unknown = new Map<string, number>(); const kinds = new Map<string, number>(); let lot = 0;
for (let seed = 1; seed <= 10; seed++) {
  const w = buildWorld(seed, 1); pickWitness(w); runYears(w, 10); scoreAll(w);
  for (const e of w.events) {
    if (!(e.t >= w.startPresent && e.w >= 1 && e.surprise != null && e.surprise > 0.5 && (e.explain ?? 0) <= 0.5)) continue;
    lot++;
    for (const c of e.causes) {
      if (c.key?.startsWith('against:')) continue;
      let known = false;
      if (c.kind === 'event' && c.ref != null) known = w.events[c.ref].knownBy.has(w.witness!) || w.events[c.ref].who.includes(w.witness!);
      else if ((c.kind === 'trait' || c.kind === 'value' || c.kind === 'bond') && c.who != null && c.key) { const b = belief(w, w.witness!, c.who, c.kind === 'value' ? 'value:' + c.key : c.key); known = !!b && b.n > 0; }
      else if (c.kind === 'want') { const b = belief(w, w.witness!, c.who ?? e.who[0], 'want:' + (c.key ?? '')); known = !!b && b.n > 0; }
      else known = e.vis !== 'private';
      const k = c.kind + (c.key ? ':' + c.key.replace(/:\d+$/, ':N') : c.kind === 'state' ? ':' + c.label.slice(0, 28) : '');
      kinds.set(k, (kinds.get(k) ?? 0) + 1); if (!known) unknown.set(k, (unknown.get(k) ?? 0) + 1);
    }
  }
}
console.log('lottery events', lot);
for (const [k, n] of [...kinds].sort((a, b) => (unknown.get(b[0]) ?? 0) - (unknown.get(a[0]) ?? 0)).slice(0, 25)) console.log(k.padEnd(50), 'unknown', String(unknown.get(k) ?? 0).padStart(4), 'of', n);
