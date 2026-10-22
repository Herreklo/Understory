import re
# ---------- line kinds (on the normalised text), first match wins ----------
KINDS = [
    # routine: friendships made, ended, renewed
    ('friend made', 'routine', r"found a friend in|became friends|are friends now|have become friends|made X feel at home|started seeing each other$"),
    ('friend ended', 'routine', r"stopped seeing each other|lost touch|drifted out of each other's lives|drifted apart\.$|stopped trying to reach"),
    ('friend renewed', 'routine', r"picked up where they had left off|on speaking terms again|back to normal with X|are close again"),
    # routine: habits and persona notes
    ('habit/persona', 'routine', r"^X (is now|now) |^X (is )?no longer (?!talks about wanting)|^Once again, |^Typical: |^People have noticed: |^Noticed: |^At (the|X) [^,]+, X |"
                                 r"has been practising every night|has been ORD in and last out for months|is always the last to leave|still holds X's hand|"
                                 r"has been asking after|has been taking on everything nobody else wants|^X (counts who got credit|splits things exactly even)"),
    # routine: the town's and the band's calendar
    ('town calendar', 'routine', r"summer festival|harbour day|open night|^The council (said yes|turned down)"),
    ('band routine', 'routine', r"brought a song to BAND|BAND played|played the Anchor|^X joined BAND|song as if it were|song the way it was written|best of X's song|"
                                r"say X's song was|talked about nothing but BAND|went home humming|kept bringing up the night BAND|has not missed a night|"
                                r"has been playing to anyone|BAND had to go on without"),
    # already implied: a want's end said after the event that ended it
    ('want resolved', 'routine', r"got there:|got WANT|got what she had wanted|^What X had wanted for .* was gone|gave up on it:|no longer talks about wanting|would not let it go:"),
    # routine: small kindnesses and everyday help
    ('small kindness', 'routine', r"hat went round|into the hat|in the hat for|kept turning up at X's door|looked in on X most days|came round to see X every week|"
                                  r"brought X something back|without being asked|^X had promised X to|gave X the money without being asked twice|"
                                  r"rang X and talked for an hour|how proud she was of X|gave X the money, and made sure|dropped everything for X|"
                                  r"at X's side within the hour|cleared her week for X"),
]
KRE = [(n, c, re.compile(r)) for n, c, r in KINDS]


def kind(nt):
    for n, c, r in KRE:
        if r.search(nt):
            return n, c
    return 'story act', 'story'




import packlib as _L
_NAME_RE = re.compile(r"\b(?:%s)(?:\s(?:%s))?\b" % ('|'.join(_L.NAMES), '|'.join(_L.NAMES)))


def classify_version(v, key=None):
    key = key or _L.norm
    """-> {normalised line: verdict} for lines repeated within this version (same rules as analysis.py)."""
    import collections
    g = collections.defaultdict(list)
    subj = {v['name']} | set(v['name'].split())
    for l in v['lines']:
        g[key(l['text'])].append(frozenset(_NAME_RE.findall(l['text'])) - subj)
    out = {}
    for nt, ps in g.items():
        if len(ps) < 2:
            continue
        c = kind(nt)[1]
        if c == 'routine':
            out[nt] = 'selection'
        elif len(ps) >= 3 or len(set(ps)) == 1:
            out[nt] = 'acts'
        else:
            out[nt] = 'words'
    return out
