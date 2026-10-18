# S3: fit the coarse yearly pass to the full engine.
#   python3 bench/fit.py out/s3/transitions-*.jsonl --out trees/branch-r19/src/coarse-odds.ts
# For each yearly outcome, a logistic model of its odds given the person's state and traits, fitted on person-years from full
# simulation, checked on held-out worlds, and written as a TypeScript table the coarse pass reads. Rerun after any engine change.
import json, sys, argparse, numpy as np
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.metrics import roc_auc_score

ap = argparse.ArgumentParser(); ap.add_argument('files', nargs='+'); ap.add_argument('--out', required=True); ap.add_argument('--holdout', type=int, default=1031)
a = ap.parse_args()
rows, towns, aways = [], [], []
for f in a.files:
    for l in open(f):
        d = json.loads(l)
        (rows if d['kind'] == 'py' else aways if d['kind'] == 'away' else towns).append(d)
# Friends and stress are left out: the coarse pass does not track them, so the odds must not lean on them.
keys = sorted(k for k in rows[0]['x'].keys() if k not in ('friends', 'stress'))
BINS = list(range(0, 101, 5))
def feats(x):
    v = [x[k] for k in keys]
    b = [0.0] * len(BINS); b[min(len(BINS) - 1, int(x['age'] // 5))] = 1.0
    return v + b
names = keys + [f'age{b}' for b in BINS]
X = np.array([feats(r['x']) for r in rows]); S = np.array([r['seed'] for r in rows])
mu, sd = X.mean(0), X.std(0) + 1e-9
Z = (X - mu) / sd
def col(k): return np.array([r['x'][k] for r in rows])
age, fem, part, work, ret, stud, drk = col('age'), col('female'), col('partnered'), col('working'), col('retired'), col('student'), col('drinks')
risk = {
    'died': np.ones(len(rows), bool), 'left': np.ones(len(rows), bool),
    'partnered': (part == 0) & (age >= 16), 'separated': part == 1,
    'child': (part == 1) & (fem == 1) & (age >= 16) & (age <= 50),
    'gotJob': (work == 0) & (ret == 0) & (stud == 0) & (age >= 18) & (age < 67),
    'lostJob': work == 1, 'changedJob': work == 1, 'promoted': work == 1,
    'retired': (ret == 0) & (age >= 50), 'ill': age >= 16, 'drinks': (drk == 0) & (age >= 16), 'sober': drk == 1,
}
models, report = {}, []
train = S < a.holdout; test = ~train
for k, m in risk.items():
    y = np.array([r['y'][k] for r in rows])
    tr, te = m & train, m & test
    if y[tr].sum() < 10: report.append(f'{k:11s} too rare ({int(y[tr].sum())} in training), base rate only'); models[k] = {'base': float(y[m].mean())}; continue
    clf = LogisticRegression(C=0.3, max_iter=2000).fit(Z[tr], y[tr])
    p = clf.predict_proba(Z[te])[:, 1]
    auc = roc_auc_score(y[te], p) if 0 < y[te].sum() < te.sum() else float('nan')
    report.append(f'{k:11s} n {int(m.sum()):6d}  events {int(y[m].sum()):5d}  rate {y[m].mean():.3f}  held-out AUC {auc:.2f}  predicted {p.mean():.3f} vs seen {y[te].mean():.3f}')
    clf = LogisticRegression(C=0.3, max_iter=2000).fit(Z[m], y[m])  # final model on everything
    models[k] = {'b0': float(clf.intercept_[0]), 'w': [float(v) for v in clf.coef_[0]]}
alive = np.array([r['y']['died'] == 0 and r['y']['left'] == 0 for r in rows])
ds = np.array([r['y']['dsav'] for r in rows])
lr = LinearRegression().fit(Z[alive], ds[alive]); res = ds[alive] - lr.predict(Z[alive])
models['dsav'] = {'b0': float(lr.intercept_), 'w': [float(v) for v in lr.coef_], 'sd': float(res.std())}
report.append(f'savings    R2 {lr.score(Z[alive], ds[alive]):.2f}  residual sd {res.std():.2f}')
# Coming home: odds per year away, from the people away in the full towns.
if aways:
    akeys = sorted(aways[0]['x'].keys()); AX = np.array([[a['x'][k] for k in akeys] for a in aways]); ay = np.array([a['home'] for a in aways]); AS = np.array([a['seed'] for a in aways])
    amu, asd = AX.mean(0), AX.std(0) + 1e-9; AZ = (AX - amu) / asd
    tr, te = AS < a.holdout, AS >= a.holdout
    clf = LogisticRegression(C=0.3, max_iter=2000).fit(AZ[tr], ay[tr]); p = clf.predict_proba(AZ[te])[:, 1]
    report.append(f'home       n {len(aways):6d}  events {int(ay.sum()):5d}  rate {ay.mean():.3f}  held-out AUC {roc_auc_score(ay[te], p):.2f}  predicted {p.mean():.3f} vs seen {ay[te].mean():.3f}')
    clf = LogisticRegression(C=0.3, max_iter=2000).fit(AZ, ay)
    models['home'] = {'keys': akeys, 'mu': [float(v) for v in amu], 'sd': [float(v) for v in asd], 'b0': float(clf.intercept_[0]), 'w': [float(v) for v in clf.coef_[0]]}
    st = np.array([r['y'].get('leftStudy', 0) for r in rows]); lf = np.array([r['y']['left'] for r in rows])
    models['studyShare'] = {'base': float(st.sum() / max(1, lf.sum()))}
pop = sum(t['pop'] for t in towns)
rates = {'arrivals': sum(t['arrived'] for t in towns) / pop, 'returns': sum(t['home'] for t in towns) / pop}
# Who arrives: households as the town sees them (ages of each arriving group), so the coarse pass brings families too.
groups = [g for t in towns for g in t.get('groups', [])]
rates['households'] = groups[:400]
report.append(f"arrivals per resident-year {rates['arrivals']:.4f}, returns {rates['returns']:.4f}")
with open(a.out, 'w') as f:
    f.write('// Generated by bench/fit.py from full-engine person-years. Do not edit; rerun the fit after engine changes.\n')
    f.write(f'// {len(rows)} person-years from seeds {S.min()}-{S.max()}; held-out check on seeds >= {a.holdout}.\n')
    f.write('export const ODDS = ' + json.dumps({'keys': keys, 'bins': BINS, 'mu': [float(v) for v in mu], 'sd': [float(v) for v in sd], 'models': models, 'rates': rates}) + ' as const;\n')
print('\n'.join(report))
