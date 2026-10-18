// Every expression as the target would remember it, for a woman and a man as the actor (a words check).
import { EXPRESSIONS } from '../../families';
import { shortText } from '../../grammar';
const f = { sex: 'f' } as any,
  m = { sex: 'm' } as any;
for (const e of EXPRESSIONS) if (!e.solo) console.log(`${e.id.padEnd(14)} ${shortText(e, f, m)}  |  ${shortText(e, m, f)}`);
