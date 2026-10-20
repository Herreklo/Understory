// The identity check's own test: the signature is the same for the same world built twice, and it changes when any state a system
// keeps on the world changes, named in the interface or not. Run: npx tsx src/tools/sigtest.ts (in npm test).
import './env';
import { buildWorld, runYears } from '../build';
import { signature } from './diag/signature';

const make = () => {
  const w = buildWorld(9001, 1);
  runYears(w, 1);
  return w;
};
const a = make();
const b = make();
const same = JSON.stringify(signature(a)) === JSON.stringify(signature(b));
if (!same) {
  console.error('sigtest: the same world built twice gives two signatures');
  process.exit(1);
}
// A field no interface names, as a system would keep its own record: the hash must see it.
const before = signature(a).rest;
(a as any).sigtestRecord = new Map([['1|2', { put: 3 }]]);
const after = signature(a).rest;
(a as any).sigtestRecord.get('1|2').put = 99;
const changed = signature(a).rest;
if (before === after || after === changed) {
  console.error('sigtest: a record kept on the world did not change the signature');
  process.exit(1);
}
// A derived lookup table is not hashed: rebuilding it from the people changes nothing.
(a as any).sigtestRecord = undefined;
const r0 = signature(a).rest;
a.byId = new Map(a.people.map(p => [p.id, p]));
if (signature(a).rest !== r0) {
  console.error('sigtest: rebuilding a lookup table changed the signature');
  process.exit(1);
}
console.log('sigtest: the signature is stable, sees every record kept on the world, and ignores lookup tables');
