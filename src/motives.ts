// Motives: a trait said as what it makes a person want, fear or feel, the way a person gives a reason for what they did. People explain
// intentional acts by reasons (desires, beliefs, feelings) and keep traits for the background (Malle 1999; Malle, Knobe and Nelson 2007),
// so the trait sets the weight of a consideration and the motive is what the page says. Words only: nothing here is read by a decision.
//
// Each pole of each facet has a wording, and its own wording where it meets the kinds of answer it most often explains. Each is a pair:
// the reason as given for the act, and the same pull when it argued against the act. Tokens: {she} {her} (possessive) {obj} {hers}
// {self}, and {t} for the other person (an @id); a wording with {t} is used only when there is one.
type Pair = [string, string];
type Entry = { hi: Pair; lo: Pair; hiBy?: Record<string, Pair>; loBy?: Record<string, Pair> };

const M: Record<string, Entry> = {
  sincerity: {
    hi: ['would not pretend', 'though {she} hates to pretend'],
    lo: ['said what would work', 'though {she} usually says what people want to hear'],
    hiBy: {
      honesty: ['could not bring {self} to lie', 'though lying does not come easily to {obj}'],
      discretion: ['had given {her} word', 'though {she} keeps {her} word'],
    },
    loBy: { dishonesty: ['said what would work', 'though a smooth word usually comes easily to {obj}'] },
  },
  fairness: {
    hi: ['wanted it to be fair', 'though {she} likes things to be fair'],
    lo: ['thought rules are for people who get caught', 'though {she} has never been fussy about rules'],
    hiBy: {
      honesty: ['would rather be straight about it', 'though it was not like {obj} to be anything but straight'],
      generosity: ['thought it only fair', 'though {she} likes things to be fair'],
      duty: ['had given {her} word', 'though {she} keeps {her} word'],
      dishonesty: ['thought it was owed', 'though it was not like {obj} to cheat'],
    },
    loBy: { dishonesty: ['thought nobody would notice', 'though {she} has never been fussy about rules'] },
  },
  greedAvoidance: {
    hi: ['money has never meant much to {obj}', 'though money has never meant much to {obj}'],
    lo: ['wanted the money', 'though {she} likes money'],
    hiBy: {
      generosity: ['money has never meant much to {obj}', 'though money has never meant much to {obj}'],
      honesty: ['did not want it that badly', 'though {she} has never wanted much'],
    },
    loBy: {
      refusal: ['did not want to part with it', 'though {she} hates to part with money'],
      dishonesty: ['wanted the money', 'though {she} wanted the money'],
    },
  },
  modesty: {
    hi: ['never thinks it is about {obj}', 'though {she} never thinks it is about {obj}'],
    lo: ['felt it was owed', 'though {she} felt it was owed'],
    hiBy: {
      humility: ['did not think it was about {obj}', 'though {she} seldom makes things about {obj}'],
      lower: ['has never needed the best of everything', 'though {she} has never needed the best of everything'],
      honesty: ['had nothing to prove', 'though {she} has nothing to prove'],
      leniency: ['does not think {she} is better than anyone', 'though {she} does not think {she} is better than anyone'],
    },
    loBy: {
      pride: ['felt it was owed', 'though {she} felt it was owed'],
      severity: ['felt slighted', 'though {she} felt slighted'],
      dishonesty: ['felt it was owed', 'though {she} felt it was owed'],
      anger: ['would not be talked down to', 'though {she} hates being talked down to'],
      humility: ['wanted the credit', 'though {she} wanted the credit'],
    },
  },
  fearfulness: {
    hi: ['was afraid of getting hurt', 'though {she} was afraid'],
    lo: ['danger has never stopped {obj}', 'though danger has never stopped {obj}'],
  },
  anxiety: {
    hi: ['could not stop thinking about what might go wrong', 'though the worry kept {obj} up at night'],
    lo: ['does not panic', 'though {she} does not panic'],
  },
  dependence: {
    hi: ['needed someone to lean on', 'though {she} needs people'],
    lo: ['would rather manage alone', 'though {she} would rather manage alone'],
    hiBy: { seeking: ['needed someone to talk to', 'though {she} needed someone to talk to'] },
    loBy: { withdrawal: ['would rather deal with it alone', 'though {she} would rather deal with things alone'] },
  },
  sentimentality: {
    hi: ['it mattered too much to let go', 'though {she} feels things deeply'],
    lo: ['has never been one to look back', 'though {she} rarely looks back'],
    hiBy: { duty: ['could not let people down who mattered to {obj}', 'though {she} feels things deeply'] },
    loBy: { humility: ['was not going to dwell on it', 'though {she} rarely dwells on things'] },
  },
  socialSelfEsteem: {
    hi: ['is easy in {her} own skin', 'though easy in {her} own skin'],
    lo: ['did not think much of {self}', 'though {she} seldom thinks much of {self}'],
  },
  socialBoldness: {
    hi: ['is not one to hang back', 'though {she} is not one to hang back'],
    lo: ['dreads being looked at', 'though {she} dreads being looked at'],
    hiBy: {
      generosity: ['did not mind everyone seeing', 'though {she} did not mind everyone seeing'],
      pride: ['would say it to anyone', 'though {she} would say it to anyone'],
      severity: ['would say it in front of anyone', 'though {she} would say it in front of anyone'],
      duty: ['was happy to stand up and do it', 'though {she} likes to be the one doing it'],
    },
    loBy: { refusal: ['did not want to be seen', 'though {she} hates being seen'] },
  },
  sociability: {
    hi: ['likes having people around', 'though {she} likes company'],
    lo: ['would rather be on {her} own', 'though {she} would rather be on {her} own'],
    loBy: { withdrawal: ['wanted to be left alone', 'though {she} would rather be left alone'] },
  },
  liveliness: {
    hi: ['has energy for everything', 'though usually full of life'],
    lo: ['had no lift in {obj}', 'though seldom one to make a fuss'],
  },
  forgiveness: {
    hi: ['lets things go', 'though {she} usually lets things go'],
    lo: ['does not forget', 'though {she} does not forget'],
    hiBy: { leniency: ['had let it go long ago', 'though {she} usually lets things go'] },
    loBy: { anger: ['had not forgiven it', 'though {she} does not forget'], severity: ['had not forgotten', 'though {she} does not forget'] },
  },
  gentleness: {
    hi: ['does not like to judge', 'though slow to judge'],
    lo: ['thought it needed saying', 'though {she} is quick to judge'],
    hiBy: {
      warmth: ['has a soft spot for anyone in trouble', 'though {she} has a soft heart'],
      leniency: ['does not like to judge', 'though slow to judge'],
    },
    loBy: { severity: ['thought {t} had it coming', 'though {she} is quick to judge'] },
  },
  flexibility: {
    hi: ['wanted to keep the peace', 'though {she} usually gives way'],
    lo: ['would not give ground', 'though {she} rarely gives ground'],
    hiBy: { other: ['is quick to try something else', 'though {she} is usually quick to try something else'] },
    loBy: { push: ['does not change course easily', 'though {she} does not change course easily'] },
  },
  patience: {
    hi: ['could wait it out', 'though slow to anger'],
    lo: ['had run out of patience', 'though {her} temper is short'],
    hiBy: {
      withdrawal: ['would rather wait it out than fight', 'though {she} usually waits things out'],
      anger: ['had been patient long enough', 'though it takes a lot to make {obj} angry'],
    },
    loBy: { seeking: ['could not sit with it any longer', 'though {her} temper is short'] },
  },
  organisation: {
    hi: ['likes things done properly and on time', 'though {she} likes things in order'],
    lo: ['had let it slide, as {she} does', 'though {her} life is usually a muddle'],
    hiBy: { lapse: ['had too much else on', 'though {she} usually keeps on top of things'] },
  },
  diligence: {
    hi: ['will not leave a job half done', 'though {she} works hard'],
    lo: ['does no more than {she} has to', 'though {she} rarely does more than {she} has to'],
  },
  perfectionism: {
    hi: ['it had to be right', 'though {she} wants things right'],
    lo: ['good enough was good enough', 'though good enough usually does for {obj}'],
  },
  prudence: {
    hi: ['thought it through first', 'though {she} usually thinks first'],
    lo: ['did not stop to think', 'though {she} rarely stops to think'],
  },
  aesthetic: {
    hi: ['is moved by beautiful things', 'though moved by beautiful things'],
    lo: ['has no time for art', 'though {she} has no time for art'],
  },
  inquisitiveness: {
    hi: ['wanted to know', 'though curious about everything'],
    lo: ['is happy with what {she} knows', 'though content with what {she} knows'],
    loBy: { reluctance: ['had no wish to see anywhere else', 'though {she} had no wish to see anywhere else'] },
  },
  creativity: {
    hi: ['had an idea of {her} own', 'though full of ideas'],
    lo: ['sticks to what works', 'though {she} sticks to what works'],
  },
  unconventionality: {
    hi: ['has never cared what is usual', 'though {she} never cares what is usual'],
    lo: ['does what people do', 'though {she} does what people do'],
  },
  altruism: {
    hi: ['puts other people first', 'though {she} usually puts other people first'],
    lo: ['looks after {her} own first', 'though {she} looks after {her} own first'],
    hiBy: {
      generosity: ['could not stand to see {t} go without', 'though {she} hates to see anyone go without'],
      warmth: ['wanted to be there for {t}', 'though {she} usually wants to help'],
      duty: ['would not let {t} down', 'though {she} hates to let anyone down'],
    },
    loBy: {
      lapse: ['had {her} own life to get on with', 'though {she} usually puts {her} own life first'],
      refusal: ['looks after {her} own first', 'though {she} looks after {her} own first'],
    },
  },
};

export type Voice = { she: string; her: string; obj: string; hers: string; self: string };
export const voiceOf = (sex: 'f' | 'm'): Voice =>
  sex === 'f'
    ? { she: 'she', her: 'her', obj: 'her', hers: 'hers', self: 'herself' }
    : { she: 'he', her: 'his', obj: 'him', hers: 'his', self: 'himself' };

// The motive for a trait reason: the facet, which pole the person is at, the kind of answer (if the reason belongs to a decision), whether
// it argued against the act, and who the other person was. Undefined when the facet has no wording (the trait label stands).
export function motive(facet: string, high: boolean, kind: string | undefined, against: boolean, v: Voice, t?: string): string | undefined {
  const e = M[facet];
  if (!e) return undefined;
  const by = high ? e.hiBy : e.loBy;
  const pick = (pair: Pair | undefined) => (pair ? pair[against ? 1 : 0] : undefined);
  let s = pick(kind ? by?.[kind] : undefined);
  if (s && s.includes('{t}') && !t) s = undefined;
  s ??= pick(high ? e.hi : e.lo)!;
  return s
    .replace(/\{t\}/g, t ?? 'them')
    .replace(/\{she\}/g, v.she)
    .replace(/\{her\}/g, v.her)
    .replace(/\{obj\}/g, v.obj)
    .replace(/\{hers\}/g, v.hers)
    .replace(/\{self\}/g, v.self);
}
export const MOTIVE_FACETS = Object.keys(M);
