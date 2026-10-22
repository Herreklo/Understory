"""Story features of a page, each a mechanical rule on the page text. Read-only.

Every rule reads a version's lines (packlib): the event text, its reasons in [brackets], and the earlier events shown under it (↳).
"The protagonist" is the person the page is about (the header's name, or its first word). "Named other" is any other run of
one or two names from the setting's name lists. Rules are written to be checkable by eye; where one is a proxy, it says so.
"""
import re, sys, os
from collections import defaultdict
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'language-scripts'))
import packlib  # noqa: E402

NM = '|'.join(sorted(packlib.NAMES, key=len, reverse=True))
NAME_RE = re.compile(r"\b((?:%s)(?: (?:%s))?)\b" % (NM, NM))
YEAR_RE = re.compile(r'\b(19\d\d|20\d\d)\b')

# --- lexicons (on the event text, not the reason) ---
CONFLICT = re.compile(
    r"dragged up what|told \w[\w ]* exactly what|made a joke at|started on \w|had a go at|went at \w|took the credit|rolled (his|her) eyes|"
    r"confronted|picked holes|snapped at|tore into|can't stand|froze \w[\w ]* out|went cold on|would not hear it|turned every point back|"
    r"defended (him|her)self|had an answer for everything|at arm's length|are both after the|stopped answering and stared|met every word|"
    r"not quite joking|sulked|\brow\b|argued|blamed|accused|walked out on|had it out|grudge|went over (his|her) head|undercut|"
    r"talked to \w[\w ]* like a child|\"you always\"|pulled the face|would not budge|told people what \w[\w ]* (had )?(done|did)|"
    r"made sure everyone knew|let \w[\w ]* take the (blame|fall)", re.I)
POS_TIE = re.compile(r"became friends|are friends now|found a friend in|have become friends|picked up where they|started seeing each other|"
                     r"got married|on speaking terms|buried the hatchet|got there: to make things right|are close again|back to normal with|"
                     r"gave \w[\w ]* another chance|moved in together", re.I)
NEG_TIE = re.compile(r"drifted apart|drifted out of each|lost touch|stopped seeing each other|split up|divorc|fell out|can't stand|froze \w[\w ]* out|"
                     r"went cold on|stopped trying to reach|walked out on|stopped talking to|no longer speaking", re.I)
GOAL_START = re.compile(r"started trying to|quietly started|means to|put (his|her) name down|has started telling people|set (his|her) heart on|"
                        r"has been asking after|wants to", re.I)
GOAL_END_WIN = re.compile(r"got there|got what (s?he|they) had wanted|got WANT", re.I)
GOAL_END_LOSE = re.compile(r"gave up on|What \w[\w ]* had wanted for .* was gone|no longer talks about wanting", re.I)
SETBACK = re.compile(r"passed over|turned down|said no|council turned down|missed the deadline|did not get|went to pieces|froze (while|at)|"
                     r"gave up on|was let go|lost (his|her) job|shied away|asked \w[\w ]* to go", re.I)
TURNS = {
    'job': re.compile(r"became [\w ]+ at|started work at|took a job|retired|resigned|lost (his|her) job|let \w[\w ]* go from|will step down|"
                      r"was let go|got the job|promoted|found work|opened|became (chief|head|skipper|foreman|manager|editor|owner)", re.I),
    'home': re.compile(r"\bmoved (in|out|away|house|to|into)\b|bought a house|got there: a house|left home", re.I),
    'partner': re.compile(r"started seeing each other|got married|split up|divorc|engaged|together since \d{4}\)?\.?$|widow", re.I),
    'household': re.compile(r"was born to|moved out|left home|took in|came to live with", re.I),
}
NOT_TURN = re.compile(r"passed over|talks about", re.I)  # a promotion lost to another, or a want, is not a turn
SECRET = re.compile(r"nobody knew|kept it to (him|her)self|kept back|found out|let people think|\blied\b|took a little from|behind \w[\w ]*'s back|"
                    r"it came out that|it got back to|without telling|secret|carrying something|what had been kept|"
                    r"has not been (him|her)self", re.I)
EXPOSE = re.compile(r"found out|it came out that|it got back to|finally told|told \w[\w ]* everything|owned up", re.I)
LETDOWN = re.compile(r"kept away just when|wasn't there for|found reasons to be busy|had left the wallet|smallest coin|could see something was wrong .* and said nothing", re.I)
DEATH = re.compile(r"\bdied\b", re.I)
ILL = re.compile(r"stroke|cancer|heart attack|hospitalised|was ill\b|diagnosed", re.I)
REPEAT_NOTE = re.compile(r"It had happened before|It was the \w+ time|not the first time|Nobody was surprised|the \w+ time since|once more|more times between")


def aliases(v):
    n = v['name']
    return {n, n.split()[0]}


def others(text, al):
    out = []
    for m in NAME_RE.findall(text):
        if m in al:
            continue
        if ' ' not in m and m in al:
            continue
        out.append(m)
    return out


def has_prot(text, al):
    return any(re.search(r'\b%s\b' % re.escape(a), text) for a in al)


def is_subject(text, al):
    t = re.sub(r'^(Typical|People have noticed|Noticed|Once again|By now)[:,] ', '', text)
    return any(t.startswith(a + ' ') or t.startswith(a + "'s ") for a in al)


def reason_years(l):
    ys = [int(y) for y in YEAR_RE.findall(l['reasons'] or '')]
    ys += [y for y, _ in l['cited']]
    return ys


def features(v):
    al = aliases(v)
    L = v['lines']
    f = {}
    n = len(L)
    years = [l['year'] for l in L]
    y0, y1 = (min(years), max(years)) if years else (0, 0)
    # --- cast: named others in lines that also name the protagonist, seen in >= 3 different years
    by_other = defaultdict(set)
    for l in L:
        if not has_prot(l['text'], al):
            continue
        for o in set(others(l['text'], al)):
            by_other[o].add(l['year'])
    cast = [o for o, ys in by_other.items() if len(ys) >= 3]
    f['cast3'] = len(cast)
    f['cast_any'] = int(len(cast) >= 1)
    f['cast2'] = int(len(cast) >= 2)
    f['cast_core'] = int(any(len(ys) >= 5 for ys in by_other.values()))  # one person with the protagonist in 5+ years
    f['cast_core_n'] = sum(1 for ys in by_other.values() if len(ys) >= 5)
    f['breadth'] = len(by_other)  # distinct named others with the protagonist
    # --- conflict with a named person (in the event text, the protagonist named)
    cl = [l for l in L if CONFLICT.search(l['text']) and has_prot(l['text'], al) and others(l['text'], al)]
    f['conflict_n'] = len(cl)
    f['conflict_any'] = int(bool(cl))
    cy = defaultdict(set)
    for l in cl:
        for o in set(others(l['text'], al)):
            cy[o].add(l['year'])
    f['feud'] = int(any(len(ys) >= 2 for ys in cy.values()))  # conflict with the same person in two or more years
    f['feud3'] = int(any(len(ys) >= 3 for ys in cy.values()))
    # let down by a named other when it mattered (neglect, not opposition)
    f['letdown_n'] = sum(1 for l in L if LETDOWN.search(l['text']) and has_prot(l['text'], al))
    # --- a want pursued over years, with a setback
    gl = [l for l in L if (GOAL_START.search(l['text']) or GOAL_END_WIN.search(l['text']) or GOAL_END_LOSE.search(l['text']))
          and is_subject(l['text'], al)]
    since = [int(y) for l in gl for y in re.findall(r'since (\d{4})', (l['reasons'] or '') + ' ' + l['text'])]
    span_years = [l['year'] for l in gl] + since
    f['want_any'] = int(bool(gl))
    long_want = bool(gl) and (max(span_years) - min(span_years) >= 2 or any(
        int(m) >= 2 for l in gl for m in re.findall(r'after (\d+) years? of wanting', l['text'])))
    setback = [l for l in L if SETBACK.search(l['text']) and is_subject(l['text'], al)]
    f['want_long'] = int(long_want)
    f['want_setback'] = int(long_want and bool(setback))
    f['want_won'] = int(any(GOAL_END_WIN.search(l['text']) for l in gl))
    f['want_lost'] = int(any(GOAL_END_LOSE.search(l['text']) for l in gl))
    # --- turns: job, home, partner, household changes where the protagonist is named
    tc = set()
    for l in L:
        if not has_prot(l['text'], al):
            continue
        for k, r in TURNS.items():
            if r.search(l['text']) and not NOT_TURN.search(l['text']):
                tc.add(k)
    f['turn_kinds'] = len(tc)
    f['turn_any'] = int(bool(tc))
    # --- reversal: the same named other in a tie made then broken, or broken then made (or a job gained then left)
    seq = defaultdict(list)
    for i, l in enumerate(L):
        if not has_prot(l['text'], al):
            continue
        sign = 1 if POS_TIE.search(l['text']) else (-1 if NEG_TIE.search(l['text']) else 0)
        if sign:
            for o in set(others(l['text'], al)):
                seq[o].append(sign)
    rev = sum(1 for o, s in seq.items() if any(a != b for a, b in zip(s, s[1:])))
    jobs = [i for i, l in enumerate(L) if is_subject(l['text'], al) and re.search(r"became [\w ]+ at|started work at|took a job|found work", l['text'])]
    jobend = [i for i, l in enumerate(L) if is_subject(l['text'], al) and re.search(r"retired|resigned|lost (his|her) job|was let go|will step down|let \w[\w ]* go from", l['text'])]
    if jobs and jobend and max(jobend) > min(jobs):
        rev += 1
    f['reversal_n'] = rev
    f['reversal_any'] = int(rev > 0)
    # --- an open thread at the page's end
    open_ = False
    last_goal = [l for l in gl]
    if last_goal and GOAL_START.search(last_goal[-1]['text']) and not (GOAL_END_WIN.search(last_goal[-1]['text']) or GOAL_END_LOSE.search(last_goal[-1]['text'])):
        open_ = True
    for o, s in seq.items():
        if s and s[-1] == -1:
            last_neg = max(l['year'] for l in L if has_prot(l['text'], al) and o in others(l['text'], al) and NEG_TIE.search(l['text']))
            if last_neg >= y1 - 2:
                open_ = True
    for o, ys in cy.items():
        if max(ys) >= y1 - 1:
            open_ = True
    sec_open = [i for i, l in enumerate(L) if re.search(r'nobody knew|has not been (him|her)self|kept back', l['text']) and is_subject(l['text'], al)]
    sec_close = [i for i, l in enumerate(L) if re.search(r'came through it|finally told|owned up|found out', l['text']) and has_prot(l['text'], al)]
    if sec_open and (not sec_close or max(sec_close) < max(sec_open)):
        open_ = True
    f['open_end'] = int(open_)
    # --- a secret or something hidden (the protagonist named)
    sl = [l for l in L if SECRET.search(l['text']) and has_prot(l['text'], al)]
    f['secret_n'] = len(sl)
    f['secret_any'] = int(bool(sl))
    hid = [i for i, l in enumerate(L) if SECRET.search(l['text']) and has_prot(l['text'], al) and not EXPOSE.search(l['text'])]
    exp = [i for i, l in enumerate(L) if EXPOSE.search(l['text']) and has_prot(l['text'], al)]
    f['secret_arc'] = int(bool(hid) and any(e > min(hid) for e in exp))  # hidden, then out
    # --- a death or loss, and what followed it
    dl = [(i, l) for i, l in enumerate(L) if DEATH.search(l['text'])]
    f['death_any'] = int(bool(dl))
    after = 0
    if dl:
        i0 = dl[0][0]
        for l in L[i0 + 1:]:
            rs = (l['reasons'] or '') + ' ' + ' '.join(t for _, t in l['cited'])
            if DEATH.search(rs):
                after += 1
    f['death_after_n'] = after
    f['death_aftermath'] = int(after >= 2)
    f['ill_any'] = int(any(ILL.search(l['text']) and has_prot(l['text'], al) for l in L))
    # --- callbacks: a reason that points back to an earlier year of the page (seen on the page), or to before it
    cb_page = cb_any = 0
    for l in L:
        ys = reason_years(l)
        if any(y < l['year'] for y in ys):
            cb_any += 1
        if any(y0 <= y < l['year'] for y in ys):
            cb_page += 1
    f['callback_n'] = cb_page
    f['callback_any_n'] = cb_any
    # --- a choice with a cost: the protagonist acts against the grain ("though", "despite" in the reason)
    cc = [l for l in L if is_subject(l['text'], al) and re.search(r'\bthough\b|\bdespite\b|\beven so\b', l['reasons'] or '')]
    f['cost_n'] = len(cc)
    f['cost_any'] = int(bool(cc))
    # --- descriptors (not candidates)
    f['subject_share'] = sum(is_subject(l['text'], al) for l in L) / n if n else 0
    f['absent_share'] = sum(not has_prot(l['text'], al) for l in L) / n if n else 0
    seen, rep = set(), 0
    for l in L:
        k = packlib.loose(l['text'])
        rep += k in seen
        seen.add(k)
    f['repeat_share'] = rep / n if n else 0
    f['note_share'] = sum(bool(REPEAT_NOTE.search(l['text'])) for l in L) / n if n else 0
    f['years_spanned'] = len(set(years))
    # a proxy for kinds of line (distinct 3-word templates of the normalised text), checked against the key's kinds where it has them
    f['kinds_proxy'] = len({' '.join(packlib.loose(l['text']).split()[:3]) for l in L})
    return f


CANDIDATES = [
    ('cast_any', 'a cast: a named other with the protagonist in 3+ different years'),
    ('cast2', 'a cast of 2+ such people'),
    ('conflict_any', 'conflict: an opposing act between the protagonist and a named other'),
    ('feud', 'a feud: conflict with the same named other in 2+ years'),
    ('feud3', 'a long feud: conflict with the same named other in 3+ years'),
    ('cast_core', 'a core other: one named person with the protagonist in 5+ different years'),
    ('want_long', 'a want pursued over 2+ years (start to end, or "after N years of wanting")'),
    ('want_setback', 'a want over 2+ years with a setback of the protagonist on the page'),
    ('want_lost', 'a want given up'),
    ('turn_any', 'a turn: job, home, partner or household change naming the protagonist'),
    ('reversal_any', 'a reversal: a tie made then broken (or broken then mended) with one person, or a job gained then left'),
    ('open_end', 'an open thread at the end (want not reached, rupture or conflict in the last years, secret not out)'),
    ('secret_any', 'a secret or something hidden, the protagonist named'),
    ('secret_arc', 'hidden, then out (found out, told, owned up) later on the page'),
    ('death_any', 'a death on the page'),
    ('death_aftermath', 'a death followed by 2+ later lines whose reasons cite a death'),
    ('callback_n', 'callbacks: lines whose reason cites an earlier year of the page (count)'),
    ('cost_any', 'a choice against the grain: the protagonist acts and the reason says "though" or "despite"'),
]
