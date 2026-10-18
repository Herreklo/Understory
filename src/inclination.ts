// Inclination: how strongly a person is drawn to a skill, from the facets and aptitudes the setting names for it. Set by birth (facets
// and aptitudes are partly inherited, with regression to the mean) and never shown; interest is what experience makes of it.
import { SETTING } from './setting';
import type { Person } from './world';
export function inclination(p: Person, sk: string): number {
  const ws = SETTING.inclination[sk]; if (!ws) return 0;
  let z = 0; for (const k in ws) z += ws[k] * (p.facets[k] ?? p.aptitudes[k] ?? 0);
  return z;
}
