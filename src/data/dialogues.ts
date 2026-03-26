// ── VOLTEX DIALOGUE DATA ────────────────────────────────────────────────────

export interface DialogueBeat {
  speaker: string
  portrait: string   // emoji avatar
  colour: string     // hex — name label colour
  pages: string[]    // advance with SPACE / Z / Enter
}

export const kurla_intro = [
  "Rush hour.",
  "Exactly as it always is.",
  "...",
  "Crowded platforms. Noise. Movement.",
  "No one looking up.",
  "No one expecting anything.",
]

export const kurla_blast = [
  "...There it is.",
  "Eleven seconds.",
  "I counted.",
  "...",
  "I've been waiting six years for the right moment.",
  "This is it.",
  "Or close enough."
]

export const kurla_post_fight = [
  "I didn't give my name.",
  "I was gone before the police arrived.",
  "The footage is already everywhere."
]
export const DIALOGUES: Record<string, DialogueBeat[]> = {

  // ── BANDRA WEST ──────────────────────────────────────────────────────────

  priya_first_contact: [{
    speaker: 'PRIYA "STORMWALL" NAIR', portrait: '🌊', colour: '#22d3ee',
    pages: [
      'You were always going to do this. I just didn\'t know you were going to do it at rush hour.',
      'Every faction pulled that footage within the hour. They don\'t have your name yet — but your power signature is in every database that matters.',
      'The Circuit can give you 36 hours of cover. Come with me. We need to talk.',
    ],
  }],

  priya_subsequent: [{
    speaker: 'PRIYA "STORMWALL" NAIR', portrait: '🌊', colour: '#22d3ee',
    pages: [
      'Three approach vectors — NEXUS, BSC, and one unidentified.',
      'You have time. Use it.',
    ],
  }],

  civilian_shop_owner: [{
    speaker: 'SHOP OWNER', portrait: '🧔', colour: '#d0d8f0',
    pages: [
      'You see what happened at Kurla? Eleven dead. They\'re calling it a gang incident.',
      'I\'ve lived here thirty years. That was no gang.',
    ],
  }],

  civilian_student: [{
    speaker: 'STUDENT', portrait: '👩', colour: '#d0d8f0',
    pages: [
      'Someone stopped the attack at Kurla. Alone. BSC keeps pulling the footage but it keeps going back up.',
      'They\'re calling it an unauthorised operative. Nobody believes them.',
    ],
  }],

  nexus_scout: [{
    speaker: 'NEXUS OPERATIVE', portrait: '🕴', colour: '#ff7b3a',
    pages: [
      'We know what you did at Kurla Junction.',
      'Director Rao sends her compliments. She\'d like to meet — your terms, your location.',
      'The offer is generous. It gets less generous with time.',
    ],
  }],

  bsc_patrol: [{
    speaker: 'BSC FIELD OFFICER', portrait: '🪪', colour: '#ffc14a',
    pages: [
      'You match the energy profile of an unregistered Volt flagged in the Kurla incident.',
      'Registration is mandatory under the Spark Control Act.',
      '...Off the record — get legal representation before you register. That\'s my advice.',
    ],
  }],

  zara_bandra: [{
    speaker: 'ZARA IRANI', portrait: '🪨', colour: '#3ddc84',
    pages: [
      'Lucky. About time.',
      'Heard about Kurla. Also heard you spent 48 hours securing your parents before making any moves. That\'s still you.',
      'I\'ll work with you when it makes sense. I won\'t follow you anywhere. If you\'re clear on that, we don\'t have a problem.',
    ],
  }],

  // ── ROUTE ────────────────────────────────────────────────────────────────

  route_traveller: [{
    speaker: 'TRAVELLER', portrait: '🧳', colour: '#d0d8f0',
    pages: [
      'Don\'t go near the Dharavi corridor after dark. Something moved through there last week.',
      'Not exactly human. Not exactly not.',
    ],
  }],

  circuit_runner: [{
    speaker: 'CIRCUIT RUNNER', portrait: '⚡', colour: '#22d3ee',
    pages: [
      'Priya sent me. BSC checkpoint at the Kurla approach — they\'re scanning arrivals.',
      'Go around through the mill district. Slower, but clean.',
    ],
  }],

  // ── KURLA JUNCTION ───────────────────────────────────────────────────────

  kurla_survivor: [{
    speaker: 'SURVIVOR', portrait: '🧑', colour: '#d0d8f0',
    pages: [
      'I was here when it happened.',
      'They weren\'t looking for everyone. They had a list. Someone specific.',
      'The person who stopped them... they looked like they\'d been waiting for this moment.',
    ],
  }],

  kurla_investigator: [{
    speaker: 'INDEPENDENT INVESTIGATOR', portrait: '🔍', colour: '#a855f7',
    pages: [
      'Official report: four unregistered Volts, independent, no affiliation.',
      'Strike pattern: coordinated cell. Professional. Abort protocol in under sixty seconds.',
      'Someone is cleaning this very carefully. That means what happened here mattered — even as a failure.',
    ],
  }],

  // ── ITEMS ─────────────────────────────────────────────────────────────────

  chest_spark_charge: [{
    speaker: 'FOUND', portrait: '📦', colour: '#ffc14a',
    pages: ['Spark Charge (S) — Restores 20% WIL in combat. Added to inventory.'],
  }],

  chest_stabiliser: [{
    speaker: 'FOUND', portrait: '📦', colour: '#ffc14a',
    pages: ['Stabiliser — Ends Will Exhaustion immediately. Restores 10% WIL. Added to inventory.'],
  }],

  chest_stamina_pack: [{
    speaker: 'FOUND', portrait: '📦', colour: '#ffc14a',
    pages: ['Stamina Pack (S) — Restores 25% STA in combat. Added to inventory.'],
  }],

  // ── SIGNS ─────────────────────────────────────────────────────────────────

  sign_bandra_west: [{
    speaker: '', portrait: '📋', colour: '#6b7a9e',
    pages: ['BANDRA WEST — Linking Road Area.\nUpscale residential. Population: oblivious, and intending to stay that way.'],
  }],

  sign_route_connector: [{
    speaker: '', portrait: '📋', colour: '#6b7a9e',
    pages: ['BANDRA → KURLA CORRIDOR\nEstimated travel: 40 min on foot.\nCurrent BSC threat level: ELEVATED.'],
  }],

  sign_kurla_restricted: [{
    speaker: '', portrait: '📋', colour: '#ff4a6e',
    pages: ['RESTRICTED ZONE\nBureau of Spark Control — Active Investigation.\nCivilians: proceed with caution.'],
  }],

  // ── STORY TRIGGERS ────────────────────────────────────────────────────────

  story_bandra_start: [{
    speaker: 'LUCKYFER', portrait: '⚡', colour: '#5b8cff',
    pages: [
      'Bandra West. Home. Or what passes for it now.',
      'Every faction is looking for me. Priya bought me 36 hours. I need to use them.',
    ],
  }],

  story_kurla_arrival: [{
    speaker: 'LUCKYFER', portrait: '⚡', colour: '#5b8cff',
    pages: [
      'Kurla Junction. Six days ago.',
      'BSC scrubbed most of the physical evidence. But eleven deaths take longer to erase than scorch marks.',
      'Someone here was looking for something specific. I want to know what.',
    ],
  }],
}