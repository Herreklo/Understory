#!/usr/bin/env python3
"""A reading's answers (docs/method/brief.md), checked and joined. Used by the run-reading skill.

  python3 scripts/answers.py check ANSWERS PART      exits 1, saying why, unless ANSWERS answers every pair of PART in the brief's shape
  python3 scripts/answers.py join OUT ROLE-PART=ANSWERS...   joins sittings into one file keyed <role>-<part> ("novelist-1")

The check: valid JSON; every pair of the part and no other; both versions with an integer score 1 to 5; a prefer of A or B; each fault
with a kind from the brief. Citations of a line the version does not have are counted, not refused: how often readers cite a wrong line
is a measure of the brief (M38), and the scorer reports it.
"""
import json, re, sys

KINDS = {'unfit reason', 'repeat', 'wording', 'out of nowhere', 'false line'}


def part_lines(path):
    out, cur = {}, None
    for line in open(path, encoding='utf8'):
        m = re.match(r'##### (P\d+), version ([AB])', line)
        if m:
            cur = (m[1], m[2])
            out[cur] = set()
        elif cur:
            n = re.match(r'\s*(\d+)  \d{4}: ', line)
            if n:
                out[cur].add(int(n[1]))
    return out


def check(answers, part):
    lines = part_lines(part)
    want = sorted({p for p, _ in lines})
    try:
        d = json.load(open(answers))
    except (OSError, ValueError) as e:
        return [f'not valid JSON: {e}'], 0
    errs, bad = [], 0
    pairs = d.get('pairs', {})
    if sorted(pairs) != want:
        errs.append(f'pairs {sorted(pairs)} are not the part\'s {want}')
    for p in want:
        x = pairs.get(p, {})
        if x.get('prefer') not in ('A', 'B'):
            errs.append(f'{p}: prefer is {x.get("prefer")!r}')
        for v in 'AB':
            y = x.get(v)
            if not isinstance(y, dict):
                errs.append(f'{p} {v}: missing')
                continue
            if not isinstance(y.get('score'), int) or not 1 <= y['score'] <= 5:
                errs.append(f'{p} {v}: score {y.get("score")!r}')
            for f in y.get('faults', []):
                if f.get('kind') not in KINDS:
                    errs.append(f'{p} {v}: fault kind {f.get("kind")!r}')
                bad += 'line' in f and f['line'] not in lines[(p, v)]
            bad += sum(isinstance(g, int) and g not in lines[(p, v)] for g in y.get('good', []))
    return errs, bad


def main():
    if sys.argv[1] == 'check':
        errs, bad = check(sys.argv[2], sys.argv[3])
        if errs:
            print(f'{len(errs)} problems: ' + '; '.join(errs[:12]))
            sys.exit(1)
        d = json.load(open(sys.argv[2]))
        nf = sum(len(x[v].get('faults', [])) for x in d['pairs'].values() for v in 'AB')
        print(f"ok: {len(d['pairs'])} pairs, {nf} faults, {bad} citations of a line the version does not have")
    elif sys.argv[1] == 'join':
        out = {}
        for arg in sys.argv[3:]:
            name, path = arg.split('=', 1)
            d = json.load(open(path))
            d['reader'] = name.rsplit('-', 1)[0]
            out[name] = d
        json.dump(out, open(sys.argv[2], 'w'), indent=1)
        print(f'{len(out)} sittings joined in {sys.argv[2]}')


if __name__ == '__main__':
    main()
