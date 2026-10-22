# Traits, properties and feelings: what the evidence says

Scope: traits; emotion theory has its own note. The engine (`src/core.ts`, `generate.ts`, `world.ts`) has 25 facets (HEXACO-PI-R plus altruism), 10 values, 9 aptitudes, skills as ratings under an aptitude ceiling with no decay, and a `reactivity` correlating about .45 with anxiety.

## 1. How hard a trait should push

| What is predicted | Typical size | Source |
|---|---|---|
| Any individual-differences correlation | median r .19 (quartiles .11 and .29); under 3% reach .50 | [1] |
| A single act in an economic game | no trait beyond \|ρ\| .26 | [2] |
| Life outcomes (78 links) | median r .27, .19 on replication; 87% replicate | [3, 4] |
| Mortality | C .09, E .07, N .05, hostility .04; SES .02, IQ .06 | [5] |
| Divorce | N .17, A −.18, C −.13; SES .05 | [5] |
| Occupational attainment | personality β ≈ .23; IQ β .27; parental SES .09 | [5] |
| N → negative affect; E → positive affect | r .54 and .44 (corrected .64 and .54) | [7] |

**Rule.** A 1-SD trait difference should move a single decision by r ≈ .1 to .3 and a lifetime outcome by r ≈ .1 to .2. Personality, IQ and origin are of one order. A trait that settles an act (r > .5) makes people predictable.

## 2. Variation within a person

Whole Trait Theory [8, 9] treats a trait as a distribution of states. Variation within a person is about as large as between people, yet each mean is almost perfectly stable and each spread's width is a stable difference. At monthly ticks I estimate two months' means correlate about .85, so a month's level is the trait plus a deviation of SD ≈ 0.4 trait-SD, driven by situations (if-thens, life phase), not noise.

**Situation strength.** Traits predict job performance less in strong situations and more where the situation calls on the trait [10]; lab evidence is thin [11]. Give each decision a strength that scales the trait's weight: a funeral flattens people, a crisis shows them.

## 3. What others can see

In Funder's realistic accuracy model [12], a trait is judged rightly only when a situation makes it relevant and its cue is available, detected and used. Personal talk beats hours of unstructured time [13].

Self–other agreement, observed r [14]:

| Trait | Stranger | Colleague | Friend | Family |
|---|---|---|---|---|
| Extraversion | .22 | .24 | .40 | .48 |
| Conscientiousness | .13 | .18 | .38 | .42 |
| Openness | .12 | .20 | .37 | .43 |
| Agreeableness | .09 | .23 | .29 | .37 |
| Emotional stability | .08 | .14 | .33 | .43 |

Extraversion shows on the first day; emotional stability hardly shows until intimacy. Rooms show openness and conscientiousness [15]. The self knows its own anxiety best; others judge intellect and creativity better [16].

So acquaintance should cap what the player can learn, following the table; self-stories should be accurate about anxiety but flattering about intellect and kindness; honesty-humility (no stranger data found) should show mainly under temptation.

## 4. Properties beyond traits

| Property | Does it add beyond traits? | Verdict |
|---|---|---|
| Cognitive ability | Yes: a top predictor of education and occupation [5, 6] | Keep; raise the engine's r ≈ .36 among reasoning, memory and language to about .45 |
| Attachment | Big Five explain 25% of attachment anxiety, 12% of avoidance; attachment predicts relationships better [17] | Add avoidance; existing facets carry attachment anxiety |
| Values | Trait–value links are consistent but modest [18] | Keep, but the engine's r ≈ .55 to .6 (status, fairness with honesty-humility) should be capped at .4 |
| Vocational interests | The Big Five predict Realistic at R .11, Enterprising .47 [19]; interests predict 7 of 9 outcomes beyond Big Five and IQ [20] | Per-skill interest covers most, but not things over people |
| Self-esteem | The socialSelfEsteem facet holds it | Don't add |
| Grit | ρ ≈ .84 with conscientiousness; performance r ≈ .18 [21] | Don't add |
| Skills as distinct from traits | What one can do adds to what one tends to do [22] | See §7. |

## 5. Skills

- Practice explains 26% of performance variance in games, 21% music, 18% sports, 4% education, under 1% professions [23].
- Practice is 40 to 70% heritable; the twin who practised more was no more musical [24]. Interest and conscientiousness set practice; aptitude sets ceiling and rate.
- General ability matters most early and fades as a skill becomes automatic [25]; chess correlates with it at r ≈ .22 to .24 [26].
- A year unused costs d ≈ −1.4, less for physical skills [27]; half the gain goes in about 6.5 months for accuracy, 11 to 13 for speed [28].

**Engine changes:** an unused skill loses about half its gain yearly (physical skills less) and is relearned quickly; monthly gain is practice × (ceiling − rating), which gives plateaus; the engine owns the mechanism, the setting owns the list.

## 6. Feelings

- **Two routes.** Neuroticism causes distress through more stressors and stronger reactions; reactivity explains twice as much [29].
- **Dynamics.** Lingering or swinging negative feeling goes with lower well-being (ρ −.15 to −.21) [30].
- **Extraversion** raises baseline positive affect (r .44) [7], not reactions to good news [31].
- **Single episodes.** The situation outweighs disposition: for forgiveness, intent (r −.49), apology (.42) and empathy (.51) beat agreeableness (.22) and trait anger (−.18) [32].

Each kind of feeling therefore gets four knobs set by traits: **proneness** (the threshold for reading an event this way), **intensity**, **duration** (decay) and **handling** (what the person does about it).

In HEXACO, anger belongs to low Agreeableness, not Emotionality [51]; sentimentality scales grief, not distress in general.

| Feeling | Raises it | Lowers it | Handling | Sizes and source |
|---|---|---|---|---|
| Grief | sentimentality, dependence (chronic), anxiety | liveliness | dependence or sociability → seeks support; an ambivalent marriage → relief | 46% resilient, 11% common grief, 16% chronic, 10% improve; chronic grief follows dependency [33]; prolonged grief about 10% [34] |
| Anger | low patience (strongest), low gentleness, low flexibility | forgiveness (faster decay) | low A → hits back; low honesty-humility → cold revenge; prudence → holds it in; rumination prolongs it | patience is the top correlate [35]; A predicts reactive aggression [36]; rumination −.33 with forgiving [32] |
| Fear | fearfulness; Emotionality raises perceived risk | — | prudence → avoids or plans; low fearfulness and prudence → reckless | [37]; sizes not extracted |
| Worry | anxiety, reactivity | organisation, diligence | C → solves the problem; N → wishful thinking, withdrawal, seeking support | N with negative affect .54 [7]; coping links hold for specific strategies [38] |
| Guilt | sincerity, fairness, altruism, sentimentality | low honesty-humility | apologises, confesses; lowers aggression [42] | clusters with honesty-humility, not Emotionality [40]; predicts prosocial acts [2]; depression r .28 [41] |
| Shame | low socialSelfEsteem, anxiety, dependence | socialSelfEsteem | hides; with low A, blames others and turns aggressive | depression r .43, external shame .56 [41]; shame leads to aggression only through blame [42] |
| Pride | authentic: diligence, socialSelfEsteem; hubristic: low modesty, low A | — | authentic → keeps at it; hubristic → dominates, goes with shame | [43]; coefficients not extracted |
| Envy | low self-esteem in a domain one cares about (skill interest, success or status values) | socialSelfEsteem | benign: works harder; malicious (low honesty-humility, low A): harms the envied | same-domain self-esteem r −.52 to −.74, and it predicts later envy [44]; [45, 46] |
| Hope | liveliness, socialSelfEsteem | anxiety | engages: makes effort and plans | optimism goes with engaged coping [38]; stable at r .61 over 6 years [47] |
| Loneliness | low sociability, low liveliness, anxiety | sociability | the sociable seek people; the anxious withdraw, a self-sustaining loop [50] | E −.37, N .36, A −.24, C −.20 [48]; mortality OR about 1.26 [49] |

## 7. General skills

Skills every person has in every setting, learned like trade skills but owned by the engine. Each must be distinct from traits, trainable, and change acts.

| Candidate | Distinct from traits? | Trainable? | Verdict |
|---|---|---|---|
| Ability EI as one score (MSCEIT) | Partly: unreliable branch scores, expert answers that miss the ablest [53, 54], job links positive only in emotional labour [55] | Moderately; practice with feedback beats lectures [56] | No global score |
| Reading people | Mostly: friends read each other about 50% better than strangers; accuracy follows closeness and attention more than traits [57] | Yes, with practice and feedback [58] | **Engine skill** |
| Keeping one's head | Partly: in the cascade perceive → understand → regulate, regulation carries neuroticism's share [55]; reappraisal changes feeling and expression, not physiology [59] | Strategies can be taught [59] | **Engine skill** |
| Self-control, follow-through | No: diligence and prudence; grit is conscientiousness [21] | Training g .30, .13 to .24 after bias correction [60] | Leave to traits |
| Persuasion, comforting | Weakly: expressive skill tracks E and N [61]; 28% of negotiation outcomes are individual, yet traits barely predict them [62] | Plausibly | Setting skills (hosting, care) on presence, socialInsight and reading people |

What the two engine skills would change:

- **Reading people** (ceiling from socialInsight): how fast and truly beliefs about another's feeling, intent or honesty update; whether grief or a lie is noticed before it is said; who gets fooled. Gained when a belief is confirmed or proved wrong. Most accuracy is knowing the particular person, so it multiplies the acquaintance cap in §3.
- **Keeping one's head:** patience and low anxiety set its start; hard feelings lived through with support raise it. It drives §6's handling knob: striking out in anger, hiding in shame, how long worry lasts, composure in a crisis. Proneness stays with traits.

## 8. Answers

**The test.** A property earns a place only if all six hold:

1. It changes a decision or how someone is read.
2. It shares under half its variance with existing properties; above r .7, derive it (grit fails).
3. It predicts a consequential outcome at r ≥ .10 beyond the existing set.
4. A player can read it, or its consequences, within a year.
5. It yields a story the current set cannot.
6. It is one number, made from what the person has plus noise.

**Likely redundant.**

- Values follow traits too closely: loosen to r ≤ .4.
- `reactivity`: keep only as the intensity knob.
- Presence and socialBoldness: keep both only as capacity versus tendency.
- Least-used facets: creativity (12 references), unconventionality (23), perfectionism (26), socialSelfEsteem (26), greedAvoidance (30). Feelings give the last three work; creativity and unconventionality need a job or should go.
- Don't add trait emotional intelligence or locus of control.

**What to add, in order:**

1. The feeling knobs above, read from existing facets.
2. Attachment avoidance: from low sentimentality, low dependence and noise; moved by betrayal and loss.
3. Skill decay.
4. Engine skills for reading people and keeping one's head (§7); later, a things–people leaning.

**Weak evidence.**

- HEXACO facet coefficients for feelings are scarce: directions are solid, knob sizes are mine.
- Most data are cross-sectional self-report; clinical gaps (N and anxiety disorders, d 1.65 [39]) halve once baseline symptoms are controlled [52].
- Month-level variability has no direct data; general-skill gain rules are mine; training studies are short.

## Sources

1. Gignac & Szodorai (2016). Effect size guidelines for individual differences researchers. *PAID* 102, 74–78. doi:10.1016/j.paid.2016.06.069
2. Thielmann, Spadaro & Balliet (2020). Personality and prosocial behavior: A theoretical framework and meta-analysis. *Psych Bull* 146(1). doi:10.1037/bul0000217
3. Soto (2019). How replicable are links between personality traits and consequential life outcomes? *Psych Sci* 30(5). doi:10.1177/0956797619831612
4. Ozer & Benet-Martínez (2006). Personality and the prediction of consequential outcomes. *Annu Rev Psychol* 57, 401–421. doi:10.1146/annurev.psych.57.102904.190127
5. Roberts, Kuncel, Shiner, Caspi & Goldberg (2007). The power of personality. *Perspect Psychol Sci* 2(4), 313–345. doi:10.1111/j.1745-6916.2007.00047.x
6. Strenze (2007). Intelligence and socioeconomic success: A meta-analytic review of longitudinal research. *Intelligence* 35(5), 401–426. doi:10.1016/j.intell.2006.09.004
7. Steel, Schmidt & Shultz (2008). Refining the relationship between personality and subjective well-being. *Psych Bull* 134(1), 138–161. doi:10.1037/0033-2909.134.1.138
8. Fleeson (2001). Traits as density distributions of states. *JPSP* 80(6), 1011–1027. doi:10.1037/0022-3514.80.6.1011
9. Fleeson & Gallagher (2009). The implications of Big Five standing for the distribution of trait manifestation in behavior. *JPSP* 97(6), 1097–1114. doi:10.1037/a0016786
10. Judge & Zapata (2015). The person–situation debate revisited. *Acad Manage J* 58(4), 1149–1179. doi:10.5465/amj.2010.0837
11. Cooper & Withey (2009). The strong situation hypothesis. *PSPR* 13(1), 62–72. doi:10.1177/1088868308329378
12. Funder (1995). On the accuracy of personality judgment: A realistic approach. *Psych Rev* 102(4), 652–670. doi:10.1037/0033-295X.102.4.652
13. Letzring, Wells & Funder (2006). Information quantity and quality affect the realistic accuracy of personality judgment. *JPSP* 91(1), 111–123. doi:10.1037/0022-3514.91.1.111
14. Connelly & Ones (2010). An other perspective on personality. *Psych Bull* 136(6), 1092–1122. doi:10.1037/a0021212 (Table 5)
15. Gosling, Ko, Mannarelli & Morris (2002). A room with a cue. *JPSP* 82(3), 379–398. doi:10.1037/0022-3514.82.3.379
16. Vazire (2010). Who knows what about a person? The SOKA model. *JPSP* 98(2), 281–300. doi:10.1037/a0017908
17. Noftle & Shaver (2006). Attachment dimensions and the Big Five personality traits. *JRP* 40, 179–208. doi:10.1016/j.jrp.2004.11.003
18. Parks-Leduc, Feldman & Bardi (2015). Personality traits and personal values: A meta-analysis. *PSPR* 19(1), 3–29. doi:10.1177/1088868314538548
19. Barrick, Mount & Gupta (2003). Meta-analysis of the relationship between the five-factor model and Holland's occupational types. *Pers Psychol* 56(1), 45–74. doi:10.1111/j.1744-6570.2003.tb00143.x
20. Stoll, Rieger, Lüdtke, Nagengast, Trautwein & Roberts (2017). Vocational interests predict life outcomes over and above IQ and Big Five. *JPSP* 113(1), 167–184. doi:10.1037/pspp0000117
21. Credé, Tynan & Harms (2017). Much ado about grit. *JPSP* 113(3), 492–511. doi:10.1037/pspp0000102
22. Yoon et al. (2024). Examining SEB skills' incremental validity over personality traits in predicting academic achievement. *PLoS ONE*. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10763938/
23. Macnamara, Hambrick & Oswald (2014). Deliberate practice and performance in music, games, sports, education, and professions. *Psych Sci* 25(8). doi:10.1177/0956797614535810
24. Mosing, Madison, Pedersen, Kuja-Halkola & Ullén (2014). Practice does not make perfect. *Psych Sci* 25(9). doi:10.1177/0956797614541990
25. Ackerman (1988). Determinants of individual differences during skill acquisition. *JEP: General* 117(3), 288–318. doi:10.1037/0096-3445.117.3.288
26. Burgoyne et al. (2016). The relationship between cognitive ability and chess skill. *Intelligence* 59, 72–83 (corrigendum 2018). https://eprints.lse.ac.uk/102241
27. Arthur, Bennett, Stanush & McNelly (1998). Factors that influence skill decay and retention. *Human Performance* 11(1), 57–101. doi:10.1207/s15327043hup1101_3
28. Tatel & Ackerman (2025). Procedural skill retention and decay: A meta-analytic review. *Psych Bull* 151(6), 696–736. doi:10.1037/bul0000481
29. Bolger & Schilling (1991). Personality and the problems of everyday life. *J Pers* 59(3), 355–386. doi:10.1111/j.1467-6494.1991.tb00253.x
30. Houben, Van Den Noortgate & Kuppens (2015). The relation between short-term emotion dynamics and psychological well-being. *Psych Bull* 141(4), 901–930. doi:10.1037/a0038822
31. Lucas & Baird (2004). Extraversion and emotional reactivity. *JPSP* 86(3), 473–485. doi:10.1037/0022-3514.86.3.473
32. Fehr, Gelfand & Nag (2010). The road to forgiveness. *Psych Bull* 136(5), 894–914. doi:10.1037/a0019993
33. Bonanno et al. (2002). Resilience to loss and chronic grief. *JPSP* 83(5), 1150–1164. doi:10.1037/0022-3514.83.5.1150
34. Lundorff et al. (2017). Prevalence of prolonged grief disorder in adult bereavement. *J Affect Disord* 212, 138–149. https://pubmed.ncbi.nlm.nih.gov/28167398/
35. Sokolovska, Dinić & Tomašević (2018). Aggressiveness in the HEXACO personality model. *Psihologija* 51(4), 449–468. doi:10.2298/PSI170705022S
36. Dinić & Wertag (2018). Effects of Dark Triad and HEXACO traits on reactive/proactive aggression. *PAID*. https://open.uns.ac.rs/handle/123456789/2674
37. Weller & Tikir (2011). Predicting domain-specific risk taking with the HEXACO personality structure. *J Behav Decis Making* 24(2), 180–201. doi:10.1002/bdm.677
38. Connor-Smith & Flachsbart (2007). Relations between personality and coping. *JPSP* 93(6), 1080–1107. doi:10.1037/0022-3514.93.6.1080; Carver & Connor-Smith (2010). Personality and coping. *Annu Rev Psychol* 61, 679–704. https://pubmed.ncbi.nlm.nih.gov/19572784/
39. Kotov, Gamez, Schmidt & Watson (2010). Linking "big" personality traits to anxiety, depressive, and substance use disorders. *Psych Bull* 136(5), 768–821. doi:10.1037/a0020327
40. Cohen, Panter, Turan, Morse & Kim (2014). Moral character in the workplace. *JPSP* 107(5), 943–963. doi:10.1037/a0037245
41. Kim, Thibodeau & Jorgensen (2011). Shame, guilt, and depressive symptoms. *Psych Bull* 137(1), 68–96. doi:10.1037/a0021466
42. Stuewig, Tangney, Heigel, Harty & McCloskey (2010). Shaming, blaming, and maiming. *JRP* 44(1), 91–102. https://pmc.ncbi.nlm.nih.gov/articles/PMC2848360
43. Tracy, Cheng, Robins & Trzesniewski (2009). Authentic and hubristic pride: The affective core of self-esteem and narcissism. *Self and Identity* 8, 196–213. https://www2.psych.ubc.ca/~henrich/pdfs/Cheng%20et%20al.%20%282010%29%20-%20Pride,%20personality,%20social%20status.pdf (cites it)
44. Erz & Rentzsch (2024). Does insecurity lead to envy? *JRP* 113, 104543. doi:10.1016/j.jrp.2024.104543
45. Lange & Crusius (2015). Dispositional envy revisited. *PSPB* 41(2), 284–294. https://kups.ub.uni-koeln.de/6623/1/Dissertation_Jens_Lange.pdf (reprinted as a chapter)
46. Lange, Paulhus & Crusius (2018). Elucidating the dark side of envy. *PSPB* 44(4). doi:10.1177/0146167217746340
47. Temporal stability of optimism and pessimism (LOT-R) over 6 years in the general population (2024). https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11222382/
48. Buecker, Maes, Denissen & Luhmann (2020). Loneliness and the Big Five personality traits: A meta-analysis. *Eur J Pers* 34(1), 8–28. doi:10.1002/per.2229
49. Holt-Lunstad, Smith, Baker, Harris & Stephenson (2015). Loneliness and social isolation as risk factors for mortality. *Perspect Psychol Sci* 10(2), 227–237. doi:10.1177/1745691614568352
50. Cacioppo & Hawkley (2009). Perceived social isolation and cognition. *Trends Cogn Sci* 13(10), 447–454. doi:10.1016/j.tics.2009.06.005
51. Ashton & Lee (2007). Empirical, theoretical, and practical advantages of the HEXACO model. *PSPR* 11(2), 150–166. doi:10.1177/1088868306294907
52. Jeronimus et al. (2016). Neuroticism's prospective association with mental disorders halves after adjustment for baseline symptoms. *Psychol Med* 46(14). https://researchconnect.suny.edu/en/publications/neuroticisms-prospective-association-with-mental-disorders-halves/
53. Fiori & Antonakis (2011). The ability model of emotional intelligence: Searching for valid measures. *PAID* 50(3), 329–334. doi:10.1016/j.paid.2010.10.010
54. Fiori et al. (2014). What is the ability emotional intelligence test (MSCEIT) good for? An evaluation using item response theory. *PLoS ONE* 9(6), e98827. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4046984/
55. Joseph & Newman (2010). Emotional intelligence: An integrative meta-analysis and cascading model. *JAP* 95(1), 54–78. doi:10.1037/a0017286
56. Mattingly & Kraiger (2019). Can emotional intelligence be trained? A meta-analytical investigation. *Hum Resour Manage Rev* 29(2), 140–155. https://digitalcommons.memphis.edu/facpubs/11930 (pooled sizes seen only in secondary reports)
57. Stinson & Ickes (1992). Empathic accuracy in the interactions of male friends versus male strangers. *JPSP* 62(5), 787–797. doi:10.1037/0022-3514.62.5.787; Ickes, Empathic accuracy (overview). https://greatergood.berkeley.edu/images/uploads/Empathic_Accuracy.pdf
58. Blanch-Hartigan, Andrzejewski & Hill (2012). The effectiveness of training to improve person perception accuracy: A meta-analysis. *Basic Appl Soc Psych* 34(6), 483–498. doi:10.1080/01973533.2012.728122
59. Webb, Miles & Sheeran (2012). Dealing with feeling: A meta-analysis of the effectiveness of strategies derived from the process model of emotion regulation. *Psych Bull* 138(4), 775–808. doi:10.1037/a0027600
60. Friese, Frankenbach, Job & Loschelder (2017). Does self-control training improve self-control? A meta-analysis. *Perspect Psychol Sci* 12(6), 1077–1099. doi:10.1177/1745691617697076
61. Riggio & Riggio (2002). Emotional expressiveness, extraversion, and neuroticism: A meta-analysis. *J Nonverbal Behav* 26(4), 195–218. doi:10.1023/A:1022117500440
62. Elfenbein, Curhan, Eisenkraft, Shirako & Baccaro (2008). Are some negotiators better than others? Individual differences in bargaining outcomes. *JRP* 42(6), 1463–1475. https://www.pon.harvard.edu/daily/negotiation-skills-daily/effective-negotiation-behavior-are-you-consistent/ (28% from this summary)
