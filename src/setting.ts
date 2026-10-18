// A plain setting pack: a small coastal town. Everything here is content, not rules.

import type { Dim } from './core';

export const SETTING = {
  name: 'Skarvik',
  culture: { O: -0.25, C: 0.1, E: 0.1 } as Partial<Record<Dim, number>>,
  places: [
    { id: 'mill', plans: ['to take on the contract for the new houses', 'to buy a second saw line', 'to cut the night shift'], name: 'Brekke Sawmill', role: 'sawmill worker', title: 'foreman', skill: 'carpentry', cap: 6, pay: 2.1, people: 0.1 },
    { id: 'harbour', plans: ['to take on a second boat', 'to fish further out this winter', 'to sell straight to the hotel in town'], name: 'the harbour fleet', role: 'fisher', title: 'skipper', skill: 'seamanship', cap: 6, pay: 2.3, people: 0.1 },
    { id: 'garage', plans: ['to start doing boats as well as cars', 'to stay open on Saturdays'], name: 'Skarvik Garage', role: 'mechanic', title: 'head mechanic', skill: 'mechanics', cap: 3, pay: 2.0, people: 0.3 },
    { id: 'clinic', plans: ['to run an evening surgery', 'to share a nurse with the next town'], name: 'the clinic', role: 'clinic staff', title: 'head of the clinic', skill: 'care', cap: 5, pay: 2.7, people: 0.8 },
    { id: 'school', plans: ['to merge the two youngest classes', 'to put on a play for the whole town'], name: 'Skarvik School', role: 'teacher', title: 'headteacher', skill: 'teaching', cap: 5, pay: 2.3, people: 0.8 },
    { id: 'paper', plans: ['to go online and stop the Saturday print', 'to run a series on the old families'], name: 'Skarvik Tidende', role: 'reporter', title: 'editor', skill: 'writing', cap: 3, pay: 2.0, people: 0.85 },
    { id: 'bar', plans: ['to open on Sundays', 'to put on music every Friday'], name: 'the Anchor', role: 'bar staff', title: 'manager', skill: 'hosting', cap: 4, pay: 1.7, people: 0.9 },
    { id: 'council', plans: ['to sell the old bank building', 'to widen the harbour road'], name: 'the council office', role: 'council clerk', title: 'chief officer', skill: 'bookkeeping', cap: 4, pay: 2.4, people: 0.5 },
  ],
  // skill id -> aptitude weights
  skills: {
    carpentry: { dexterity: 0.5, visual: 0.3, physique: 0.2 },
    seamanship: { physique: 0.6, visual: 0.2, memory: 0.2 },
    mechanics: { dexterity: 0.4, reasoning: 0.4, visual: 0.2 },
    care: { socialInsight: 0.5, memory: 0.3, physique: 0.2 },
    teaching: { language: 0.4, presence: 0.4, memory: 0.2 },
    writing: { language: 0.7, memory: 0.3 },
    hosting: { presence: 0.5, socialInsight: 0.5 },
    bookkeeping: { reasoning: 0.6, memory: 0.4 },
    guitar: { dexterity: 0.5, ear: 0.5 },
    vocals: { ear: 0.6, presence: 0.4 },
  } as Record<string, Record<string, number>>,
  hobbies: ['guitar', 'vocals'],
  // What draws a person to each skill: facets and aptitudes, weighted (setting content; the engine reads any key as a facet or an aptitude).
  inclination: {
    carpentry: { dexterity: 0.3, visual: 0.2, diligence: 0.25, inquisitiveness: 0.1 },
    seamanship: { physique: 0.3, fearfulness: -0.3, liveliness: 0.1 },
    mechanics: { reasoning: 0.25, dexterity: 0.2, inquisitiveness: 0.25 },
    care: { altruism: 0.35, gentleness: 0.2, socialInsight: 0.2 },
    teaching: { patience: 0.25, sociability: 0.15, language: 0.25 },
    writing: { language: 0.3, inquisitiveness: 0.2, aesthetic: 0.2 },
    hosting: { sociability: 0.35, liveliness: 0.2, presence: 0.15 },
    bookkeeping: { reasoning: 0.3, organisation: 0.3 },
    guitar: { aesthetic: 0.5, ear: 0.3 },
    vocals: { aesthetic: 0.5, ear: 0.3 },
  } as Record<string, Record<string, number>>,
  // Skills every child meets at school, weakly.
  school: ['writing', 'bookkeeping', 'guitar', 'vocals'],
  // How the chronicle names taking a skill up.
  skillWords: { carpentry: 'carpentry', seamanship: 'the sea', mechanics: 'engines', care: 'looking after people', teaching: 'teaching', writing: 'writing', hosting: 'running a room', bookkeeping: 'figures', guitar: 'guitar', vocals: 'singing' } as Record<string, string>,
  // Things people save for. cost in savings units; value = the drive they serve; label with @ for the owner.
  goods: [
    { id: 'boat', label: 'a boat of their own', cost: 28, value: 'freedom', habit: 'boat' },
    { id: 'house', label: 'a house of their own', cost: 45, value: 'security' },
    { id: 'car', label: 'a decent car', cost: 14, value: 'status' },
    { id: 'trip', label: 'the big trip abroad', cost: 10, value: 'thrill' },
  ] as { id: string; label: string; cost: number; value: string; habit?: string }[],
  moveCost: 8, // what it takes to leave
  // Groups: people making something together. The core knows only the shape; each kind is content.
  // binding: 'voluntary' (you stay because you want to; leaving costs friendships) or 'contractual' (pay, and a lead can remove you).
  // measure: how the world counts the group's work, in the setting's words.
  groupKinds: [
    { id: 'band', noun: 'band', work: 'song', show: 'gig', place: 'bar', skills: ['guitar', 'vocals'], wantKind: 'prove', binding: 'voluntary', minSize: 2, maxSize: 4, workEvery: 4, showEvery: 5, measure: 'the crowd it draws', names: ['the Harbour Lights', 'Low Tide', 'the Brekke Boys', 'Saltwater', 'the Night Shift', 'Skarvik Radio', 'the Mill Hands', 'North of Here', 'the Lanterns', 'Driftwood', 'the Late Ferry', 'Red Sky'] },
  ] as { id: string; noun: string; work: string; show: string; place: string; skills: string[]; wantKind: string; binding: 'voluntary' | 'contractual'; minSize: number; maxSize: number; workEvery: number; showEvery: number; measure: string; names: string[] }[],
  // Titles for what groups make: a few patterns over the town's own words, so a town can write hundreds of songs and never the same one twice.
  titles: {
    fixed: ['Harbour Light', 'Low Tide', 'Nothing for Me Here', 'The Late Ferry', 'Saltwater', "Your Father's Boat", 'Friday at the Anchor', 'North of Here', 'The Long Way Round', 'Red Sky', 'What the Sea Keeps', 'Sunday Dinner', 'Every Boat by Name', 'The Open Night', 'Brekke', 'Nineteen', 'Card Night', 'The Clinic Steps', 'A Card at Christmas', 'The Inspection', 'Foreman', 'Small Hours'],
    adj: ['Red', 'Last', 'Late', 'Long', 'Quiet', 'Cold', 'Early', 'Grey', 'Lost', 'Still', 'Thin', 'Warm', 'Wrong', 'Empty', 'Slow', 'Old'],
    noun: ['Ferry', 'Sky', 'Tide', 'Harbour', 'Winter', 'Morning', 'Sunday', 'Kitchen', 'Road', 'Light', 'Window', 'Letter', 'Boat', 'Shift', 'Rain', 'Coast', 'Bridge', 'Shore', 'Smoke', 'Wake', 'Coat', 'Key', 'Fence', 'Quay'],
    place: ['the Anchor', 'the Mill', 'the Quay', 'the Clinic', 'the Garage', 'the Ferry', 'the Sawmill', 'the Point', 'the Harbour', 'the Hill', 'the School', 'the Pier'],
    time: ['Friday', 'Saturday', 'Sunday', 'Midsummer', 'Christmas', 'November', 'March', 'Midnight', 'Four in the Morning', 'Closing Time', 'First Light', 'Low Water'],
    day: ['Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Weeknight'],
    verb: ['Leaving', 'Waiting', 'Staying', 'Coming Home', 'Going Under', 'Holding On', 'Letting Go', 'Turning Back', 'Running Late', 'Walking Out', 'Keeping Still', 'Looking Back'],
    patterns: ['{adj} {noun}', 'The {adj} {noun}', '{time} at {place}', '{verb} ({place})', '{verb} on a {day}', '{noun} and {noun}', 'What the {noun} Knows', 'No {noun} Tonight', 'A {noun} for {time}', '{time} {noun}', 'Behind {place}', 'The {noun} at {place}', 'Nobody at {place}', 'After {time}'],
  },
  // Habits: the routines a life here can settle into. fit() says who takes them up.
  // Plans that need other people (projects.ts). A venture opens a new place; a cause is one night, again next year if it went well.
  // The stuff of people's lives, for the quirks persona.ts builds (a pattern from a trait, filled from a life). Setting content.
  material: {
    trade: {
      carpentry: ['the plane', 'the chisels', 'the saw blades', 'the spirit level', 'the measuring tape'],
      seamanship: ['the nets', 'the old compass', 'the radio', 'the catch book', 'the gaff'],
      mechanics: ['the socket set', 'the torque wrench', 'the tyre gauge', 'the parts drawer'],
      care: ['the thermometer', 'the blood-pressure cuff', 'the appointment book', 'the first-aid bag'],
      teaching: ['the register', 'the classroom globe', 'the chalk box', 'the board rubber'],
      writing: ['the typewriter', 'the clippings file', 'the dictionary', 'the red pen'],
      hosting: ['the glasses', 'the corkscrew', 'the till', 'the bar towels'],
      bookkeeping: ['the ledger', 'the stapler', 'the rubber stamps', 'the calculator'],
    },
    anything: ['the kettle', 'the radio', 'the shed door', 'the car keys', 'the garden tools'],
    counts: ['boat that came into the harbour', 'snowfall', 'bird on the feeder', 'ferry that ran late', 'match the local team played', 'storm that closed the road', 'cruise ship that passed', 'frost before October', 'power cut', 'whale seen from the point', 'funeral in the church'],
    mementos: ['a pebble from the beach at Kvitsand', 'a brass button off a uniform', 'a ferry ticket from 1989', 'a photograph with the corner torn off', 'a fishing fly that never caught anything'],
    keepsakes: ['Christmas card', 'match ticket', 'letter', 'photograph', 'birthday card'],
    rooms: ['the living room', 'the bookshelf', 'the kitchen windowsill', 'the front garden', 'the hallway', 'the garage', 'the boathouse', 'the spare room', 'the pantry', 'the porch', 'the cellar', 'the attic'],
    chores: ['the washing-up', 'the bins', 'the woodpile', 'the gutters', 'the accounts', 'the windows', 'the ironing', 'the hoovering', 'the shopping', 'the snow-clearing', 'the hedge', 'the car washing', 'the bird feeder', 'the Sunday dinner'],
    doors: ['the fridge', 'the back door', 'the hall cupboard', 'the pantry door', 'the bathroom mirror', 'the noticeboard in the hall', 'the inside of the front door'],
    topics: ['the war', 'shipwrecks on this coast', 'old weather records', 'the royal family', 'the herring years', 'birds of the north coast', 'the oil money'],
    programmes: ['quiz show', 'weather forecast', 'detective series', 'shipping news'],
    foods: ['fish cakes', 'brown cheese', 'liver paste', 'lefse', 'waffles', 'mustard', 'pickled herring'],
    dangers: ['quay edge', 'chainsaw', 'boat in winter', 'old mine shaft'],
    buildings: ['the church', 'the co-op', 'the school gym', 'the fish plant'],
    events: ['the Christmas concert', 'the 17th of May parade', 'a christening', 'the school play', 'the harbour day speeches'],
    sports: ['football', 'trotting at Forus', 'ski jumping'],
    townthings: ['house on the harbour road', 'boat in the harbour', 'family in the churchyard', 'name on the war memorial'],
    nearby: ['the next town over', 'the county fair', 'the city, and only twice'],
    places: ['the quay', 'the Anchor', 'the co-op', 'the church hill', 'the end of the breakwater', 'the shore road'],
    odd: ['a stuffed puffin', 'a ship\'s bell from a wreck', 'a jar of sea glass sorted by colour', 'a whalebone', 'a collection of old ferry timetables'],
    tunes: ['an old dance-band waltz', 'a hymn nobody else remembers', 'a jingle from a radio advert', 'a pop song from 1986'],
    hiding: ['the biscuit tin', 'a boot in the wardrobe', 'the freezer', 'an old tobacco tin under the floor'],
    wishes: ['a bigger boat', 'a cabin up the valley', 'a trip to see the northern lights from a hotel', 'a new kitchen'],
    possessions: ['the front door', 'the garden fence', 'the letterbox', 'the old pickup'],
  },
  // Small loves: what people light up about. A few dozen things, chosen by temperament with a share of chance, so people overlap.
  loves: [
    { text: 'fish soup on Fridays', facets: { tradition: 0.5 } }, { text: 'the first snow', facets: { sentimentality: 0.4, aesthetic: 0.3 } },
    { text: 'storms, from inside', facets: { aesthetic: 0.4, fearfulness: 0.2 } }, { text: 'the football on Saturdays', facets: { sociability: 0.4, liveliness: 0.3 } },
    { text: 'crosswords', facets: { inquisitiveness: 0.4, sociability: -0.3 } }, { text: 'old dance-band records', facets: { sentimentality: 0.4, tradition: 0.3 } },
    { text: 'strong coffee all day long', facets: { diligence: 0.3 } }, { text: 'cloudberries in August', facets: { tradition: 0.3, aesthetic: 0.2 } },
    { text: 'the ski jumping on television', facets: { thrill: 0.4 } }, { text: 'a good argument', facets: { socialBoldness: 0.4, gentleness: -0.3 } },
    { text: 'the light in March', facets: { aesthetic: 0.5 } }, { text: 'knitting in front of the news', facets: { patience: 0.4, sociability: -0.2 } },
    { text: 'detective novels from the library', facets: { inquisitiveness: 0.3, sociability: -0.3 } }, { text: 'the dance at the community hall', facets: { sociability: 0.5, liveliness: 0.4 } },
    { text: 'fixing other people\'s bicycles', facets: { altruism: 0.3, perfectionism: 0.3 } }, { text: 'lottery tickets', facets: { prudence: -0.4, greedAvoidance: -0.3 } },
    { text: 'the ferry crossing on a calm day', facets: { aesthetic: 0.3, liveliness: -0.2 } }, { text: 'gossip with a cup of tea', facets: { sociability: 0.5, sincerity: -0.2 } },
    { text: 'cold swims', facets: { thrill: 0.4, fearfulness: -0.4 } }, { text: 'church on Christmas Eve', facets: { tradition: 0.6, sentimentality: 0.3 } },
    { text: 'heavy metal, loud', facets: { unconventionality: 0.4, liveliness: 0.3 } }, { text: 'birdwatching', facets: { patience: 0.4, inquisitiveness: 0.3 } },
    { text: 'card games that go on past midnight', facets: { sociability: 0.4, prudence: -0.3 } }, { text: 'a tidy house', facets: { organisation: 0.5, perfectionism: 0.3 } },
    { text: 'waffles on Sundays', facets: { lovedOnes: 0.4, tradition: 0.3 } }, { text: 'the long evenings in June', facets: { sociability: 0.3, aesthetic: 0.3 } },
    { text: 'politics on the radio', facets: { inquisitiveness: 0.3, socialBoldness: 0.3 } }, { text: 'their dog', facets: { altruism: 0.3, sentimentality: 0.3 } },
  ],
  projects: [
    { id: 'cafe', kind: 'venture', label: 'to open a café in the old bank', short: 'the café', values: ['success', 'freedom'], facets: { socialBoldness: 0.4, sociability: 0.3, prudence: -0.2 }, skill: 'hosting', money: 24, helpers: 2, permission: true, months: [12, 24], threatens: 'bar', place: { name: 'the Old Bank Café', role: 'café staff', title: 'owner', skill: 'hosting', cap: 3, pay: 1.6, people: 0.9 } },
    { id: 'festival', kind: 'cause', label: 'to put on a summer festival on the quay', short: 'the summer festival', values: ['fittingIn', 'pleasure', 'tradition'], facets: { sociability: 0.5, socialBoldness: 0.3, organisation: 0.3 }, money: 0, helpers: 5, permission: true, months: [6, 10], yearly: true },
  ],
  habits: [
    { id: 'swim', shows: { diligence: 1, fearfulness: -1 }, label: 'swims in the harbour every morning, whatever the weather', kind: 'solo', fit: (p: any) => 0.5 * p.aptitudes.physique + 0.4 * p.facets.diligence - 0.3 * p.facets.fearfulness },
    { id: 'shore', shows: { sentimentality: 1, sociability: -1 }, label: 'walks the shore every evening', kind: 'solo', fit: (p: any) => 0.5 * p.facets.sentimentality - 0.4 * p.facets.sociability + 0.3 * p.facets.aesthetic },
    { id: 'reads', shows: { inquisitiveness: 1, sociability: -0.5 }, label: 'reads late into every night', kind: 'solo', fit: (p: any) => 0.6 * p.facets.inquisitiveness + 0.3 * p.aptitudes.language - 0.3 * p.facets.sociability },
    { id: 'anchor', together: 'Fridays at the Anchor brought them together', shows: { sociability: 1, liveliness: 0.5 }, label: 'is at the Anchor every Friday without fail', kind: 'social', place: 'bar', fit: (p: any) => 0.6 * p.facets.sociability + 0.3 * p.facets.liveliness - 0.2 * p.facets.prudence },
    { id: 'sunday', shows: { sentimentality: 1, 'value:tradition': 1 }, label: 'has Sunday dinner with the family every week', kind: 'family', fit: (p: any) => 0.5 * p.values.tradition + 0.4 * p.facets.sentimentality + 0.3 * p.values.lovedOnes },
    { id: 'early', shows: { diligence: 1, organisation: 1 }, label: 'is first in at work every morning', kind: 'work', fit: (p: any) => 0.6 * p.facets.diligence + 0.4 * p.facets.organisation + 0.2 * p.values.success },
    { id: 'tinker', shows: { perfectionism: 1, sociability: -0.5 }, label: 'spends every spare hour fixing something in the shed', kind: 'solo', fit: (p: any) => 0.5 * p.aptitudes.dexterity + 0.3 * p.facets.perfectionism - 0.3 * p.facets.sociability },
    { id: 'run', shows: { diligence: 1 }, label: 'runs the coast road every other day', kind: 'solo', fit: (p: any) => 0.5 * p.aptitudes.physique + 0.4 * p.facets.diligence - 0.2 * p.facets.sentimentality },
    { id: 'cards', together: 'cards on Tuesdays at the Anchor brought them together', shows: { sociability: 1, prudence: -0.5 }, label: 'plays cards at the Anchor on Tuesdays', kind: 'social', place: 'bar', fit: (p: any) => 0.4 * p.facets.sociability + 0.3 * p.values.pleasure - 0.3 * p.facets.diligence + 0.2 * p.facets.liveliness },
    { id: 'garden', shows: { patience: 1 }, label: 'is out in the garden every morning from spring to autumn', kind: 'solo', fit: (p: any) => 0.5 * p.facets.patience + 0.3 * p.values.tradition + 0.2 * p.facets.aesthetic - 0.2 * p.facets.liveliness },
    { id: 'call', shows: { dependence: 1, sentimentality: 1 }, label: 'rings their mother every Sunday evening', kind: 'family', fit: (p: any) => 0.5 * p.facets.dependence + 0.4 * p.facets.sentimentality + 0.2 * p.values.lovedOnes },
    { id: 'choir', together: 'the choir brought them together', shows: { sociability: 0.5, 'value:fittingIn': 1 }, label: 'sings with the choir every Thursday', kind: 'social', fit: (p: any) => 0.5 * p.aptitudes.ear + 0.3 * p.facets.sociability + 0.3 * p.values.fittingIn },
    { id: 'drink', shows: { prudence: -1, sociability: 0.5 }, label: 'has two pints at the Anchor after every shift', kind: 'body', place: 'bar', fit: (p: any) => 0.4 * p.facets.sociability - 0.4 * p.facets.prudence + 0.3 * p.values.pleasure },
    { id: 'boat', shows: { 'value:freedom': 1 }, label: 'is out on the boat every weekend', kind: 'solo', fit: () => -9 },
    { id: 'practise', shows: { diligence: 1, aesthetic: 1 }, label: 'practises every night after the house has gone quiet', kind: 'practice', fit: () => -9 },
  ] as { id: string; shows: Record<string, number>; label: string; kind: 'solo' | 'social' | 'family' | 'practice' | 'work' | 'body'; place?: string; fit: (p: any) => number }[],
  // What there is to be tempted by, per place
  resources: { mill: 'the timber account', harbour: 'the catch', garage: 'the parts bill', clinic: 'the medicine cupboard', school: 'the trip money', paper: 'the expenses', bar: 'the till', council: 'the expense claims' } as Record<string, string>,
  // Dishonest acts, by place (what low Fairness looks like there)
  cheats: {
    mill: 'selling timber on the side', harbour: 'under-reporting the catch', garage: 'charging for parts never fitted', clinic: 'covering up a mistake with a patient',
    school: 'faking a pupil’s grades', paper: 'making up a quote', bar: 'skimming from the till', council: 'fiddling expense claims',
  } as Record<string, string>,
  names: {
    f: ['Hanne', 'Ingrid', 'Marit', 'Siri', 'Tove', 'Liv', 'Astrid', 'Karin', 'Eva', 'Nora', 'Ida', 'Sunniva', 'Maja', 'Ellen', 'Rut', 'Vigdis', 'Berit', 'Mona', 'Lise', 'Agnes', 'Thea', 'Selma', 'Unni', 'Kari', 'Gro', 'Hilde', 'Aud', 'Ragnhild', 'Mari', 'Linn', 'Signe', 'Elin', 'Turid', 'Frida', 'Oda', 'Solveig', 'Tuva', 'Amalie', 'Live', 'Synne'],
    m: ['Arne', 'Bjørn', 'Tor', 'Leif', 'Odd', 'Per', 'Knut', 'Rolf', 'Geir', 'Svein', 'Even', 'Jonas', 'Sindre', 'Magnus', 'Erik', 'Håkon', 'Øyvind', 'Rune', 'Terje', 'Kjetil', 'Anders', 'Olav', 'Ivar', 'Jon', 'Lars', 'Stian', 'Vegard', 'Halvor', 'Mats', 'Tobias', 'Eirik', 'Audun', 'Sverre', 'Nils', 'Trond', 'Birk', 'Emil', 'Oskar', 'Sander', 'Aksel'],
    sur: ['Brekke', 'Lund', 'Vik', 'Haugen', 'Strand', 'Moen', 'Dahl', 'Berg', 'Nygaard', 'Solberg', 'Aas', 'Holm', 'Lie', 'Eide', 'Rød', 'Sæther', 'Myhre', 'Tangen', 'Fjeld', 'Bakke', 'Næss', 'Hovland', 'Skog', 'Kvam', 'Ulvik', 'Vang', 'Sunde', 'Ruud', 'Hagen', 'Lyng'],
  },
};
