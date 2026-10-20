// Switches named in the environment (OFF=a,b and ON=c) for every runner that imports this first, so `ON=telling npm test` turns the
// mechanism on in every check the suite runs. The engine never reads its environment (docs/scale/portability.md); the tools do, here.
import { OFF, ON } from '../world';

for (const x of (process.env.OFF ?? '').split(',').filter(Boolean)) OFF.add(x);
for (const x of (process.env.ON ?? '').split(',').filter(Boolean)) ON.add(x);
