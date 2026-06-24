export type ClaimStatus = 'verified' | 'needs-proof' | 'do-not-use';

export type ClaimKey =
  | 'insured'
  | 'vettedTeam'
  | 'dbsChecked'
  | 'responseTimes'
  | 'qualityChecks'
  | 'keyholding'
  | 'outOfHoursCleaning'
  | 'iso9001'
  | 'reviewCount'
  | 'namedClientExamples';

export interface ClaimLedgerEntry {
  key: ClaimKey;
  label: string;
  status: ClaimStatus;
  publicText?: string;
  fallbackText: string;
  sourceNote: string;
}

export const claimLedger: Record<ClaimKey, ClaimLedgerEntry> = {
  insured: {
    key: 'insured',
    label: 'Insurance cover',
    status: 'needs-proof',
    fallbackText: 'clear scopes',
    sourceNote:
      'Source docs ask Pedro to confirm insurance before public use; keep fallback wording until proof is available.',
  },
  vettedTeam: {
    key: 'vettedTeam',
    label: 'Vetted team',
    status: 'needs-proof',
    fallbackText: 'trusted cleaning team',
    sourceNote:
      'Vetting is recommended language but still listed as a proof check in the source docs.',
  },
  dbsChecked: {
    key: 'dbsChecked',
    label: 'DBS checked team',
    status: 'needs-proof',
    fallbackText: 'carefully briefed cleaning team',
    sourceNote:
      'DBS checked is explicitly listed as a claim requiring confirmation before public use.',
  },
  responseTimes: {
    key: 'responseTimes',
    label: 'Response times',
    status: 'needs-proof',
    fallbackText: 'clear next steps',
    sourceNote:
      'Fast or same-day response is a proof check; avoid time promises until confirmed.',
  },
  qualityChecks: {
    key: 'qualityChecks',
    label: 'Quality checks',
    status: 'needs-proof',
    fallbackText: 'agreed cleaning scope',
    sourceNote:
      'Quality checks are useful proof language, but the docs request confirmation before public use.',
  },
  keyholding: {
    key: 'keyholding',
    label: 'Keyholding',
    status: 'needs-proof',
    fallbackText: 'careful access arrangements',
    sourceNote:
      'Keyholding and access process are listed as proof needed for property and commercial pages.',
  },
  outOfHoursCleaning: {
    key: 'outOfHoursCleaning',
    label: 'Out-of-hours cleaning',
    status: 'needs-proof',
    fallbackText: 'cleaning planned around your opening hours',
    sourceNote:
      'Out-of-hours support appears in draft page language but remains proof-dependent in the docs.',
  },
  iso9001: {
    key: 'iso9001',
    label: 'ISO 9001',
    status: 'needs-proof',
    fallbackText: 'documented cleaning scope',
    sourceNote:
      'ISO 9001 is explicitly listed as a claim requiring confirmation before public use.',
  },
  reviewCount: {
    key: 'reviewCount',
    label: 'Review count',
    status: 'needs-proof',
    fallbackText: 'client feedback available on request',
    sourceNote:
      'The docs ask for review count confirmation; do not publish a number until verified.',
  },
  namedClientExamples: {
    key: 'namedClientExamples',
    label: 'Named client examples and case studies',
    status: 'needs-proof',
    fallbackText: 'relevant examples can be discussed during scoping',
    sourceNote:
      'Named clients, logos, and case studies need approval or evidence before public use.',
  },
};

export function publicClaim(key: ClaimKey, fallback = ''): string {
  const claim = claimLedger[key];

  if (claim.status === 'verified' && claim.publicText) {
    return claim.publicText;
  }

  return fallback || claim.fallbackText;
}

export const proofClaims = Object.values(claimLedger);
