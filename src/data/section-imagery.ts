import { isConfirmedHqcPhoto } from './page-visuals';

// Section imagery from the 6 November 2026 images report. Each entry places
// images after an approved copy section that was previously text only.
// Generated images are illustrative and are never used as client proof.
export type SectionImage = {
  src: string;
  srcset: string;
  alt: string;
  illustrative: boolean;
};

const base = '/images/phase8-nov6';
const generated = (name: string, alt: string): SectionImage => ({
  src: `${base}/${name}-800.webp`,
  srcset: `${base}/${name}-800.webp 800w, ${base}/${name}-1600.webp 1600w`,
  alt,
  illustrative: true
});

export const offeringImages = {
  home: generated('home-a', 'Georgian living room with sash windows and a linen sofa.'),
  workplace: generated('workplace-a', 'Modern office with desks and the London skyline beyond.'),
  complex: generated('complex-a', 'Cleaner in a teal uniform wiping a communal stair handrail.')
};

const complexLobby = generated('complex-b', 'Cleaner mopping a shared apartment-block lobby beside a lift.');
const scopeAndPlanning = generated('scope-and-planning', 'Cleaners inspecting a stair handrail with a clipboard.');
const communalLiftLobby = generated('communal-lift-lobby', 'Shared apartment-block entrance with lift doors and a cleaning trolley.');
const propertyHandover = generated('property-handover', 'Empty apartment kitchen with open cupboards.');
const workplaceTouchpoints = generated('workplace-touchpoints', 'Cleaner wiping a meeting table in a bright office.');

// Earlier HQC library photographs: brightness only, no retouching or crop. Captioned as
// illustrative until Pedro confirms them (confirmedHqcPhotoIds in page-visuals.ts).
const livingRoom: SectionImage = {
  src: `${base}/old-living-room-800.webp`,
  srcset: `${base}/old-living-room-800.webp 800w, ${base}/old-living-room-1536.webp 1536w`,
  alt: 'Living area with a dining table, sofa and wide windows.',
  illustrative: !isConfirmedHqcPhoto('p-2267193ade')
};
const windowCleaning: SectionImage = {
  src: `${base}/old-approved-window-cleaning-800.webp`,
  srcset: `${base}/old-approved-window-cleaning-800.webp 800w, ${base}/old-approved-window-cleaning-1079.webp 1079w`,
  alt: 'Person dusting white window shutters with a long-handled duster.',
  illustrative: !isConfirmedHqcPhoto('p-1ef63f3b16')
};

const threeOfferings = [offeringImages.home, offeringImages.workplace, complexLobby];

export const sectionImagery: Record<string, { after: string; images: SectionImage[] }[]> = {
  'property-facilities-cleaning-london': [
    { after: 'One Partner Across the Property Lifecycle', images: [scopeAndPlanning] },
    { after: 'A Clearer Way to Mobilise Recurring Property Cleaning', images: [communalLiftLobby] }
  ],
  'office-cleaning-london': [
    { after: 'Cleaning That Fits the Way Your Workplace Operates', images: [offeringImages.workplace] },
    { after: 'What an HQC Office Cleaning Programme Can Cover', images: [workplaceTouchpoints] }
  ],
  'home-cleaning-london': [
    { after: 'Which Home Cleaning Service Is Right for You?', images: [offeringImages.home] },
    { after: 'Essential Clean™: Maintain and Improve', images: [livingRoom] }
  ],
  'essential-clean-london': [
    { after: 'Is Essential Clean™ the Right Service for Your Home?', images: [offeringImages.home] },
    { after: 'What Essential Clean™ Is Designed to Do', images: [livingRoom] }
  ],
  'deep-cleaning-london': [
    { after: 'When Routine Cleaning Is Not Enough', images: [offeringImages.home] },
    { after: 'What a Deep Clean™ May Cover', images: [livingRoom] }
  ],
  'end-of-tenancy-cleaning-london': [{ after: 'A Clear Scope Matters', images: [propertyHandover] }],
  'move-in-cleaning-london': [{ after: 'Start with a Clean Baseline', images: [propertyHandover] }],
  'post-construction-cleaning-london': [{ after: 'The Property Must Be Ready for Cleaning', images: [propertyHandover] }],
  'communal-area-cleaning-london': [
    { after: 'Clean Shared Spaces Support a Better-Managed Building', images: [complexLobby] },
    { after: 'Areas We Can Include', images: [communalLiftLobby] }
  ],
  'estate-letting-agent-cleaning-london': [{ after: 'One Route for Different Property Outcomes', images: [propertyHandover] }],
  'move-in-void-property-cleaning-london': [{ after: 'What the Scope May Include', images: [propertyHandover] }],
  'portfolio-cleaning-support-london': [
    { after: 'One Relationship. Different Property Outcomes.', images: [scopeAndPlanning] },
    { after: 'What Better Coordination Can Look Like', images: [communalLiftLobby] }
  ],
  'commercial-cleaning-london': [
    { after: 'Start with the Site and the Outcome', images: [offeringImages.workplace] },
    { after: 'Recurring Programmes Are Built Around a Service Profile', images: [workplaceTouchpoints] }
  ],
  'commercial-deep-cleaning-london': [
    { after: 'When a Commercial Deep Clean May Be Appropriate', images: [offeringImages.workplace] },
    { after: 'What We Assess', images: [workplaceTouchpoints] }
  ],
  'complex-property-cleaning-london': [
    { after: 'When the Complex Route May Be Appropriate', images: [communalLiftLobby] },
    { after: 'Why We Assess Before We Quote', images: [scopeAndPlanning] }
  ],
  'how-we-work': [
    { after: '3. We Define the Scope', images: [scopeAndPlanning] },
    { after: '6. We Deliver the Agreed Service', images: [windowCleaning] }
  ],
  'cleaning-prices-london': [{ after: 'Why Bedroom Count Alone Is Not Enough', images: [scopeAndPlanning] }],
  'why-choose-hqc': [
    { after: 'The Scope Is Made Clear', images: [scopeAndPlanning] },
    { after: 'Teams Receive Practical Information', images: [windowCleaning] }
  ],
  'about-high-quality-clean': [
    { after: 'Homes, Workplaces and Property Teams', images: [offeringImages.home, offeringImages.workplace, offeringImages.complex] }
  ],
  'areas-we-cover': [{ after: 'London Coverage', images: threeOfferings }],
  'cleaning-services-east-london': [{ after: 'East London Areas We Are Building Around', images: threeOfferings }]
};
