"""Shared parsing and normalising of reading packs. Read-only."""
import re, os, json

ROOT = '/Users/oystein/Documents/GitHub/Understory'
S = open(os.path.join(ROOT, 'src/setting.ts')).read()
_names = S[S.find('  names: {'):]
NAMES = set(re.findall(r"'([A-Z][a-z]+)'", _names))
_g = S[S.find('groupKinds'):S.find('titles:')]
BANDS = sorted(set(re.findall(r"'((?:the )?[A-Z][A-Za-z ]+)'", _g[_g.find('names:'):])), key=len, reverse=True)
BANDS = [b for b in BANDS if b not in ('band',)]

HEAD = re.compile(r'^##### (P\d+), version ([AB]) — (.+?), (\d+) in (\d{4})')
LINE = re.compile(r'^\s*(?:(\d+)\s+)?(\d{4}): (.*)$')
SUB = re.compile(r'^\s*(?:\d+\s+)?↳ (\d{4}): (.*)$')


def split_reasons(s):
    # text  [reasons]   (two spaces then a bracket at the end)
    i = s.find('  [')
    if i >= 0:
        r = s[i + 3:].rstrip()
        return s[:i].strip(), r[:-1] if r.endswith(']') else r
    return s.strip(), None


def parse_pack(path):
    """-> list of versions: {pair, ver, name, lines:[{year,text,reasons,cited:[(year,text)], n}]}"""
    vs = []
    cur = None
    for raw in open(path, encoding='utf-8'):
        raw = raw.rstrip('\n')
        h = HEAD.match(raw)
        if h:
            cur = {'pair': h.group(1), 'ver': h.group(2), 'name': h.group(3), 'age': int(h.group(4)), 'lines': []}
            vs.append(cur)
            continue
        if cur is None or not raw.strip():
            continue
        m = SUB.match(raw)
        if m:
            if cur['lines']:
                cur['lines'][-1]['cited'].append((int(m.group(1)), m.group(2)))
            continue
        m = LINE.match(raw)
        if m:
            t, r = split_reasons(m.group(3))
            n = int(m.group(1)) if m.group(1) else len(cur['lines']) + 1
            cur['lines'].append({'year': int(m.group(2)), 'text': t, 'reasons': r, 'cited': [], 'n': n})
    return vs


NOTE = re.compile(
    r'\s*(It had happened before, in \d{4}\.|It was the \w+ time(?:, after [\d, and]+| since \d{4})?\.|It was not the first time\.|'
    r'Nobody was surprised any more:[^.]*\.|\((?:the \w+ time since \d{4}|and (?:once more|\d+ more times) between)\))\s*$')


def strip_note(t):
    prev = None
    while prev != t:
        prev = t
        t = NOTE.sub('', t).strip()
    return t


def norm(t, keep_notes=False):
    if not keep_notes:
        t = strip_note(t)
    t = re.sub(r'"[^"]*"', '"T"', t)
    for b in BANDS:
        t = t.replace(b, 'BAND')
    # names: a run of capitalised name words -> X
    def nm(m):
        return 'X'
    t = re.sub(r"\b(?:%s)(?:\s(?:%s))?\b" % ('|'.join(NAMES), '|'.join(NAMES)), 'X', t)
    t = re.sub(r'\bX(?:, X)*(?: and X)\b', 'X', t)  # lists of people
    t = re.sub(r'\b(19|20)\d{2}\b', 'Y', t)
    t = re.sub(r'\b\d+\b', 'N', t)
    t = re.sub(r'\b(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)\b', 'ORD', t)
    t = re.sub(r'\b(she|he)\b', 'she', t)
    t = re.sub(r'\b(her|his|him)\b', 'her', t)
    t = re.sub(r'\b(herself|himself)\b', 'herself', t)
    return t


def actkey(t):
    return norm(t)


def loose(t):
    """A looser key: the same act said with another prefix or number form."""
    t = norm(t)
    t = re.sub(r'^(Typical|People have noticed|Noticed|Once again|By now)[:,] ', '', t)
    t = re.sub(r'^At (the |X)[^,]*, ', '', t)
    t = re.sub(r'\b(year|month)s\b', r'\1', t)
    t = re.sub(r'\ba year\b', 'N year', t)
    t = re.sub(r'^X got (there: .*|what she had wanted.*)$', 'X got WANT', t)
    t = re.sub(r', (within the year|after N year of wanting it)\.$', '.', t)
    return t
