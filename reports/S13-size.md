# S13 sizing: the background's odds refitted on r45 (throwaway seeds)

Engine `f545484` (r45). Train towns 9101–9130 (`transitions.ts 9101 9130 20`, fitted with `fit.py --holdout 9124`); cities 9131–9135 (`city2.ts 920 <seed> 2 2`), once with r27's odds (main) and once with the sized refit. The fit's own held-out report, then `report7.py <cities> <train towns>` for each arm.

## The fit

```
died        n  48395  events   556  rate 0.011  held-out AUC 0.92  predicted 0.011 vs seen 0.012
left        n  48395  events   517  rate 0.011  held-out AUC 0.88  predicted 0.011 vs seen 0.013
partnered   n  15554  events   905  rate 0.058  held-out AUC 0.72  predicted 0.062 vs seen 0.057
separated   n  24475  events   630  rate 0.026  held-out AUC 0.77  predicted 0.025 vs seen 0.023
child       n   6017  events   411  rate 0.068  held-out AUC 0.77  predicted 0.071 vs seen 0.068
gotJob      n   3043  events   489  rate 0.161  held-out AUC 0.80  predicted 0.188 vs seen 0.128
lostJob     n  22478  events   325  rate 0.014  held-out AUC 0.65  predicted 0.015 vs seen 0.013
changedJob  n  22478  events   366  rate 0.016  held-out AUC 0.66  predicted 0.015 vs seen 0.016
promoted    n  22478  events   329  rate 0.015  held-out AUC 0.61  predicted 0.016 vs seen 0.014
retired     n   7027  events   477  rate 0.068  held-out AUC 0.92  predicted 0.072 vs seen 0.070
ill         n  40029  events  2151  rate 0.054  held-out AUC 0.81  predicted 0.054 vs seen 0.053
drinks      n  38194  events   325  rate 0.009  held-out AUC 0.84  predicted 0.009 vs seen 0.008
sober       n   1835  events   229  rate 0.125  held-out AUC 0.53  predicted 0.155 vs seen 0.140
savings    R2 0.15  residual sd 15.17
home       n  12979  events   381  rate 0.029  held-out AUC 0.80  predicted 0.029 vs seen 0.033
arrivals per resident-year 0.0069, returns 0.0063
```

## Cities with r27's odds

```
death reference from the full towns: {'died 65-79': '197/9372 = 0.0210', 'died 80+': '334/3602 = 0.0927', 'died <65': '25/35421 = 0.0007'}
seeds [9131, 9132, 9133, 9134, 9135]
1 capacity: PASS  over-capacity [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], leaderless [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], living elsewhere [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
2 coarse matches full (monthly half / background half, mean over seeds)
   under20         0.192 / 0.148  gap -4.5 pt  PASS   per seed: [(0.196, 0.163), (0.169, 0.153), (0.202, 0.134), (0.196, 0.148), (0.198, 0.141)]
   over65          0.289 / 0.303  gap +1.4 pt  PASS   per seed: [(0.283, 0.288), (0.302, 0.302), (0.268, 0.289), (0.298, 0.337), (0.295, 0.302)]
   partnered       0.638 / 0.614  gap -2.4 pt  PASS   per seed: [(0.581, 0.563), (0.619, 0.634), (0.672, 0.649), (0.647, 0.629), (0.674, 0.596)]
   working         0.826 / 0.867  gap +4.0 pt  PASS   per seed: [(0.789, 0.898), (0.845, 0.829), (0.819, 0.846), (0.878, 0.878), (0.801, 0.882)]
   drinks          0.050 / 0.052  gap +0.2 pt  PASS   per seed: [(0.065, 0.049), (0.048, 0.046), (0.037, 0.057), (0.049, 0.066), (0.053, 0.043)]
   kidsPerAdult40  1.299 / 1.139  ratio 0.88  PASS   per seed: [(1.211, 0.776), (1.5, 1.105), (1.343, 1.455), (1.224, 1.103), (1.219, 1.254)]
   (reported) n            687.800 / 609.200
   (reported) birthsPerK   10.019 / 8.046
   (reported) deathsPerK   4.945 / 5.255
   (reported) savings      116.838 / 164.926
   (reported) retired65    0.946 / 0.953
3 engine rules in the background: deaths per person-year, pooled
   died 65-79  201/12554 = 0.0160 against 0.0210  ratio 0.76  PASS
   died 80+    255/2491 = 0.1024 against 0.0927  ratio 1.10  PASS
   died <65    72/81831 = 0.0009 against 0.0007  ratio 1.25  PASS
4 promoted against always in focus (mean over seeds)
   t4a friendsPerAdult 5.000 / 5.642  PASS
   t4a friendless      0.130 / 0.109  PASS
   t4a knownWell       29.315 / 23.624  PASS
   t4a habits          3.009 / 2.759  PASS
   t4a partnered       0.638 / 0.611  PASS
   t4b friendsPerAdult 5.001 / 5.733  PASS
   t4b friendless      0.132 / 0.097  PASS
   t4b knownWell       29.405 / 24.228  PASS
   t4b habits          2.997 / 2.677  PASS
   t4b partnered       0.636 / 0.696  PASS
5 t4a marked40: 0.495 / 0.337
5 t4a marks40: 0.863 / 0.406
5 t4b marked40: 0.491 / 0.354
5 t4b marks40: 0.884 / 0.468
6 promotion seconds per neighbourhood [4.0, 5.2, 8.2, 6.2, 6.3] build s [149.8, 119.5, 127.7, 122.6, 133.7]
```

## Cities with the refit

```
death reference from the full towns: {'died 65-79': '197/9372 = 0.0210', 'died 80+': '334/3602 = 0.0927', 'died <65': '25/35421 = 0.0007'}
seeds [9131, 9132, 9133, 9134, 9135]
1 capacity: PASS  over-capacity [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], leaderless [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], living elsewhere [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
2 coarse matches full (monthly half / background half, mean over seeds)
   under20         0.202 / 0.154  gap -4.8 pt  PASS   per seed: [(0.207, 0.154), (0.207, 0.166), (0.204, 0.144), (0.198, 0.148), (0.194, 0.158)]
   over65          0.282 / 0.300  gap +1.8 pt  PASS   per seed: [(0.27, 0.282), (0.276, 0.293), (0.259, 0.285), (0.3, 0.333), (0.303, 0.305)]
   partnered       0.648 / 0.601  gap -4.7 pt  PASS   per seed: [(0.621, 0.557), (0.642, 0.608), (0.662, 0.661), (0.675, 0.585), (0.639, 0.593)]
   working         0.827 / 0.856  gap +2.9 pt  PASS   per seed: [(0.779, 0.876), (0.852, 0.828), (0.807, 0.822), (0.879, 0.876), (0.819, 0.876)]
   drinks          0.056 / 0.063  gap +0.7 pt  PASS   per seed: [(0.069, 0.053), (0.053, 0.056), (0.05, 0.074), (0.034, 0.068), (0.074, 0.065)]
   kidsPerAdult40  1.481 / 1.070  ratio 0.72  FAIL   per seed: [(1.293, 0.962), (1.493, 0.949), (1.716, 1.197), (1.561, 0.803), (1.343, 1.438)]
   (reported) n            697.000 / 620.200
   (reported) birthsPerK   10.286 / 7.895
   (reported) deathsPerK   4.813 / 5.197
   (reported) savings      116.706 / 153.712
   (reported) retired65    0.950 / 0.954
3 engine rules in the background: deaths per person-year, pooled
   died 65-79  203/12555 = 0.0162 against 0.0210  ratio 0.77  PASS
   died 80+    256/2472 = 0.1036 against 0.0927  ratio 1.12  PASS
   died <65    71/81296 = 0.0009 against 0.0007  ratio 1.24  PASS
4 promoted against always in focus (mean over seeds)
   t4a friendsPerAdult 4.804 / 5.870  PASS
   t4a friendless      0.136 / 0.119  PASS
   t4a knownWell       29.096 / 23.262  PASS
   t4a habits          2.985 / 2.812  PASS
   t4a partnered       0.648 / 0.613  PASS
   t4b friendsPerAdult 4.788 / 5.803  PASS
   t4b friendless      0.134 / 0.108  PASS
   t4b knownWell       29.331 / 24.175  PASS
   t4b habits          3.012 / 2.756  PASS
   t4b partnered       0.650 / 0.726  FAIL
5 t4a marked40: 0.500 / 0.383
5 t4a marks40: 0.923 / 0.472
5 t4b marked40: 0.500 / 0.406
5 t4b marks40: 0.916 / 0.548
6 promotion seconds per neighbourhood [2.1, 2.4, 2.9, 2.3, 2.3] build s [72.6, 61.6, 67.4, 64.5, 69.5]
```
