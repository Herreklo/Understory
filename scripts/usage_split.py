"""Extra summary on top of the adapted usage scan: main session against subagents, mean context per request,
re-reading share, by model and kind, over the whole record and over the window the main transcript covers."""
import importlib.util, os, sys, collections, statistics, json, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('scan', os.path.join(HERE, 'usage_scan.py'))
scan = importlib.util.module_from_spec(spec); spec.loader.exec_module(scan)


def parts(r):
    p = scan.PRICE.get(r['fam'])
    if not p:
        return dict(read=0, write=0, inp=0, out=0)
    return dict(read=r['read'] * p[3] / 1e6, write=(r['w5m'] * p[1] + r['w1h'] * p[2]) / 1e6,
                inp=r['inp'] * p[0] / 1e6, out=r['out'] * p[4] / 1e6)


def ctx(r):
    return r['inp'] + r['read'] + r['w5m'] + r['w1h']


def human_turns(path):
    """Times of the person's own messages in a main transcript (not tool results, not meta, not task notifications)."""
    out = []
    for line in open(path, 'rb'):
        if b'"type":"user"' not in line[:2048]:
            continue
        try:
            d = json.loads(line)
        except Exception:
            continue
        if d.get('isMeta') or d.get('isCompactSummary'):
            continue
        c = (d.get('message') or {}).get('content')
        if isinstance(c, list):
            if any(isinstance(x, dict) and x.get('type') == 'tool_result' for x in c):
                continue
            c = ' '.join(x.get('text', '') for x in c if isinstance(x, dict))
        c = (c or '').strip()
        # the person's messages arrive wrapped in a timezone reminder; other reminders and notifications are not theirs
        if not c or c.startswith('<task-notification') or (c.startswith('<system') and "The user's timezone" not in c[:80]):
            continue
        out.append(scan.ts_of(d.get('timestamp')))
    return sorted(t for t in out if t)


def report(jobs, label):
    tot = collections.Counter(); grp = collections.defaultdict(collections.Counter)
    for j in jobs:
        g = 'main' if j.main else 'sub'
        for r in j.rs:
            pr = parts(r)
            for k, v in pr.items():
                grp[g][k] += v; tot[k] += v
                grp['model:' + (r['fam'] or '-')][k] += v
                grp['kind:' + scan.classify(j)][k] += v
    T = sum(tot.values()) or 1
    print(f'\n== {label}: weighted ${T:.0f}')
    for g in sorted(grp, key=lambda g: (g.split(':')[0] if ':' in g else '0', -sum(grp[g].values()))):
        s = sum(grp[g].values())
        print(f"  {g:22} ${s:7.1f} {100*s/T:5.1f}%   of it: re-read {100*grp[g]['read']/(s or 1):4.0f}%  "
              f"cache write {100*grp[g]['write']/(s or 1):4.0f}%  output {100*grp[g]['out']/(s or 1):4.0f}%")
    print(f"  re-reading (cache reads) as a share of all usage: {100*tot['read']/T:.1f}%")


def main():
    jobs, _, _ = scan.load()
    mains = [j for j in jobs if j.main]
    for j in mains:
        cs = [ctx(r) for r in j.rs]
        print(f"main {j.id}: {len(j.rs)} requests from {scan.local(j.t0)} to {scan.local(j.t1)} (Oslo); "
              f"context per request mean {statistics.mean(cs)/1e3:.0f}k, median {statistics.median(cs)/1e3:.0f}k, "
              f"max {max(cs)/1e3:.0f}k, min {min(cs)/1e3:.0f}k")
        hs = human_turns(j.path)
        print(f"  the person's messages in this transcript: {len(hs)}; requests per message: {len(j.rs)/max(len(hs),1):.1f}")
        # mean context at each human turn: the first request after each message
        firsts = []
        for h in hs:
            nxt = [r for r in j.rs if r['t'] >= h]
            if nxt:
                firsts.append(ctx(min(nxt, key=lambda r: r['t'])))
        if firsts:
            print(f"  context at the first request after each message: mean {statistics.mean(firsts)/1e3:.0f}k, "
                  f"median {statistics.median(firsts)/1e3:.0f}k")
        # context over time, in quarters
        q = len(j.rs) // 4 or 1
        print('  mean context by quarter of the transcript: ' +
              ', '.join(f"{statistics.mean(ctx(r) for r in j.rs[i:i+q])/1e3:.0f}k" for i in range(0, len(j.rs), q)))
    report(jobs, 'everything in the transcripts')
    if mains:
        lo = min(j.t0 for j in mains)
        win = []
        for j in jobs:
            rs = [r for r in j.rs if r['t'] >= lo]
            if rs:
                j2 = scan.Job(j.path, j.main, j.meta); j2.rs = rs; j2.acts = j.acts; j2.desc = j.desc
                win.append(j2)
        report(win, f'only the window the main transcript covers (from {scan.local(lo)} Oslo)')
    subs = [j for j in jobs if not j.main]
    by = collections.defaultdict(list)
    for j in subs:
        d = j.desc.lower()
        k = ('cold reader' if 'reader' in d else 're-deriver' if 're-derive' in d else 'design' if d.startswith('design')
             else 'other')
        by[k].append(j)
    print('\n== subagents by role')
    for k, js in sorted(by.items(), key=lambda x: -sum(j.cost for j in x[1])):
        c = sorted(j.cost for j in js); mx = sorted(j.maxctx for j in js); n = sorted(len(j.rs) for j in js)
        print(f"  {k:12} n={len(js):3} total ${sum(c):6.1f}  median ${c[len(c)//2]:.1f}  median peak context {mx[len(mx)//2]/1e3:.0f}k  "
              f"median requests {n[len(n)//2]}  models {dict(collections.Counter(j.model for j in js))}")
    rounds = collections.Counter()
    for j in by['cold reader']:
        rounds[scan.local(j.t0, '%d %b')] += j.cost
    print('  cold readers by day: ' + ', '.join(f'{d} ${c:.0f}' for d, c in rounds.items()))


if __name__ == '__main__':
    main()
