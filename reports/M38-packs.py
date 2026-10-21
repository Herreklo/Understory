#!/usr/bin/env python3
"""M38's packs made from pages already on file (docs/BOARD.md, round M38). Nothing the engine does is run.

  python3 reports/M38-packs.py

Writes, each as reports/M38-reading-<name>-pack.txt and -key.json, and in parts of twelve pairs as out-M38/<name>/pairs-<n>.txt:

- shuffled: round 41's busiest, the on arm's page of each of the 24 people, against the same page with its reasons shuffled between its
  lines of the same year (each reason, with the earlier events shown under it, moves to another line of its year that had a reason; no
  reason stays in place). Within the year, so no reason or event shown under a line is dated after it: the true page can be told only
  by reading the reasons (the review of M38 found a shuffle across years gave it away by its dates).
- planted: the same 24 pages against the same page with one small fault: one line in the middle third of the page is given the reason
  of a line at least ten lines earlier whose reason differs. The key marks the line ({"planted": {"arm": "off", "line": n}}).
- r40: round 40's busiest pack as it was read, with its lines numbered, for the calibration re-read (CLAUDE.md, "The reading").

In shuffled and planted, the key's "on" is the true page and "off" the altered one; which is version A is dealt half and half, then
shuffled, as pairarm.ts deals it. Lines are numbered as pairarm.ts numbers them since M38.
"""
import json, os, random, re

R = 'reports'
LINE = re.compile(r'^(\d{4}: .*?)(  \[.*\])?((?:  \([^\[\]]*\))?)$')


def versions(path):
    """{(pair, 'A'|'B'): (header, [line, ...])}, each line with the events shown under it (↳) as a list."""
    out, cur = {}, None
    for raw in open(path, encoding='utf8'):
        raw = raw.rstrip('\n')
        m = re.match(r'##### (P\d+), version ([AB]) — (.*)', raw)
        if m:
            cur = (m[1], m[2])
            out[cur] = (m[3], [])
        elif cur and raw.strip():
            if raw.lstrip().startswith('↳'):
                out[cur][1][-1][1].append(raw.strip())
            else:
                out[cur][1].append([raw, []])
    return out


def split(line):
    m = LINE.match(line)
    assert m, line
    return m[1], m[2] or '', m[3]


def number(lines):
    out = []
    for i, (line, cited) in enumerate(lines, 1):
        out.append(f'{i:>3}  {line}')
        out += [f'       {c}' for c in cited]
    return out


def shuffle(lines, rng):
    """Each reason, with its cited events, moves to another line of its year that had one (Sattolo's cycle within the year: no reason
    stays in place). A year with one line that has a reason keeps it."""
    out = [[l, list(c)] for l, c in lines]
    changed = 0
    for y in sorted({l[:4] for l, _ in lines}):
        units = [(i, split(l)[1], cited) for i, (l, cited) in enumerate(lines) if l[:4] == y and split(l)[1]]
        perm = list(range(len(units)))
        for k in range(len(perm) - 1, 0, -1):
            j = rng.randrange(k)
            perm[k], perm[j] = perm[j], perm[k]
        for k, (i, why, _) in enumerate(units):
            _, why2, cited2 = units[perm[k]]
            text, _, again = split(lines[i][0])
            out[i] = [text + why2 + again, list(cited2)]
            changed += why2 != why
    return out, changed


def plant(lines, rng):
    """One line in the middle third takes the reason of a line at least ten lines earlier whose reason differs. Returns its number."""
    n = len(lines)
    why = [split(l)[1] for l, _ in lines]
    targets = [i for i in range(n // 3, 2 * n // 3) if why[i] and any(why[d] and why[d] != why[i] for d in range(0, i - 9))]
    i = rng.choice(targets)
    d = rng.choice([d for d in range(0, i - 9) if why[d] and why[d] != why[i]])
    text, _, again = split(lines[i][0])
    out = [[l, list(c)] for l, c in lines]
    out[i] = [text + why[d] + again, list(lines[d][1])]
    return out, i + 1


def deal(name, n):
    """True first in half the pairs, shuffled by the pack's name (pairarm.ts's rule)."""
    order = [i < n // 2 for i in range(n)]
    random.Random('M38 ' + name).shuffle(order)
    return order


def write(name, pairs, key):
    os.makedirs(f'out-M38/{name}', exist_ok=True)
    blocks = []
    for p in sorted(pairs):
        (head, a), (_, b) = pairs[p]['A'], pairs[p]['B']
        blocks.append(f'##### {p}, version A — {head}\n' + '\n'.join(a) + f'\n\n##### {p}, version B — {head}\n' + '\n'.join(b) + '\n')
    open(f'{R}/M38-reading-{name}-pack.txt', 'w').write('\n'.join(blocks))
    for k in range(0, len(blocks), 12):
        open(f'out-M38/{name}/pairs-{k // 12 + 1}.txt', 'w').write('\n'.join(blocks[k:k + 12]))
    json.dump(key, open(f'{R}/M38-reading-{name}-key.json', 'w'), indent=1)


def main():
    src = versions(f'{R}/41-reading-busiest-pack.txt')
    key41 = json.load(open(f'{R}/41-reading-busiest-key.json'))
    ps = sorted(key41)
    for name in ('shuffled', 'planted'):
        rng = random.Random('M38 ' + name)
        order = deal(name, len(ps))
        pairs, key, report = {}, {}, []
        for p, true_first in zip(ps, order):
            head, lines = src[(p, key41[p]['onIs'])]
            assert len(lines) == key41[p]['on']['lines'], p
            if name == 'shuffled':
                alt, changed = shuffle(lines, rng)
                extra = {'changed': changed}
                report.append(changed)
            else:
                alt, at = plant(lines, rng)
                extra = {'planted': {'arm': 'off', 'line': at}}
                report.append(at)
            true, false = (head, number(lines)), (head, number(alt))
            pairs[p] = {'A': true if true_first else false, 'B': false if true_first else true}
            m = {'lines': len(lines), 'kinds': key41[p]['on']['kinds']}
            key[p] = {'seed': key41[p]['seed'], 'person': key41[p]['person'], 'name': key41[p]['name'], 'onIs': 'A' if true_first else 'B',
                      'on': m, 'off': dict(m), **extra}
        write(name, pairs, key)
        print(name, len(ps), 'pairs;', 'reasons changed a page' if name == 'shuffled' else 'planted at line', report)
    src = versions(f'{R}/40-reading-busiest-pack.txt')
    key40 = json.load(open(f'{R}/40-reading-busiest-key.json'))
    write('r40', {p: {v: (src[(p, v)][0], number(src[(p, v)][1])) for v in 'AB'} for p in sorted(key40)}, key40)
    print('r40', len(key40), 'pairs, numbered')


if __name__ == '__main__':
    main()
