// Card and section imagery for the image-led round (Jack, 10 November 2026).
// Every image here is a generated, illustrative library image. None of them shows HQC work,
// a client job or a result, and none may be used as evidence. Alt text describes only what
// is visible. Assignments are written out by hand per page; no image repeats within a page.

export type CardImage = { src: string; alt: string };

const nov10 = (id: string, alt: string): CardImage => ({ src: `/images/phase8-nov10/${id}.webp`, alt });
const nov6 = (name: string, alt: string): CardImage => ({ src: `/images/phase8-nov6/${name}-800.webp`, alt });

export const cardLibrary = {
  // Homes
  'r-kitchen-wipe': nov10('r-kitchen-wipe', 'Gloved hand wiping a pale stone kitchen worktop beside a spray bottle.'),
  'r-bathroom-shine': nov10('r-bathroom-shine', 'Gloved hand polishing a chrome basin tap in a marble bathroom.'),
  'r-bed-made': nov10('r-bed-made', 'Made double bed with white linen beside tall sash windows.'),
  'r-living-dust': nov10('r-living-dust', 'Cleaner in a teal uniform dusting a marble mantelpiece in a Georgian living room.'),
  'r-checklist-home': nov10('r-checklist-home', 'Room-by-room cleaning checklist on a clipboard beside a cup of tea.'),
  'r-oven-inside': nov10('r-oven-inside', 'Gloved hand cleaning the inside of an open oven.'),
  'r-cupboard-inside': nov10('r-cupboard-inside', 'Gloved hand wiping the inside of empty kitchen cupboards.'),
  'r-fridge': nov10('r-fridge', 'Gloved hand wiping the glass shelves of an empty fridge.'),
  'r-pets-home': nov10('r-pets-home', 'Hallway with a dog bed, a lead on a hook and a wooden floor.'),
  'r-front-door-keys': nov10('r-front-door-keys', 'Key in the brass lock of a black front door.'),
  'r-routine-visit': nov10('r-routine-visit', 'Cleaner in a teal uniform vacuuming a rug in a bright living room.'),
  'r-skirting': nov10('r-skirting', 'Gloved hand wiping a white skirting board above an oak floor.'),
  'r-shower-glass': nov10('r-shower-glass', 'Squeegee clearing water from a glass shower screen.'),
  'r-sofa-vacuum': nov10('r-sofa-vacuum', 'Vacuum crevice tool cleaning between linen sofa cushions.'),
  'r-empty-flat': nov10('r-empty-flat', 'Empty living room with bare oak floorboards and large windows.'),
  'r-boxes-movein': nov10('r-boxes-movein', 'Stacked moving boxes in an empty modern kitchen.'),
  'r-inventory': nov10('r-inventory', 'Hand holding a pen over an inventory clipboard on a window sill.'),
  'r-viewing-ready': nov10('r-viewing-ready', 'Tidy living room with plumped cushions and sunlight through the windows.'),
  'r-hallway-floor': nov10('r-hallway-floor', 'Cleaner in a teal uniform mopping a herringbone hallway floor.'),
  'r-bathroom-reset': nov10('r-bathroom-reset', 'Bright bathroom with folded towels, a bath and tiled walls.'),
  // Workplaces and commercial sites
  'c-desks': nov10('c-desks', 'Cleaner in a teal uniform wiping desks in an empty open-plan office at dusk.'),
  'c-washroom': nov10('c-washroom', 'Office washroom with a row of basins and mirrors, and a gloved hand restocking paper towels.'),
  'c-staff-kitchen': nov10('c-staff-kitchen', 'Cleaner in a teal uniform wiping the counter of an office staff kitchen.'),
  'c-floor-scrubber': nov10('c-floor-scrubber', 'Cleaner in a teal uniform using a floor scrubber across an office lobby.'),
  'c-waste': nov10('c-waste', 'Cleaner in a teal uniform emptying office recycling bins into a sack.'),
  'c-touchpoints': nov10('c-touchpoints', 'Gloved hand wiping a stainless steel lift call button panel.'),
  'c-after-hours': nov10('c-after-hours', 'Empty office at dusk with a cleaning trolley in the aisle and city lights outside.'),
  'c-reception': nov10('c-reception', 'Office reception with glass security gates and a key fob on the desk.'),
  'c-meeting-reset': nov10('c-meeting-reset', 'Gloved hand wiping a long meeting room table with a city view.'),
  'c-high-level': nov10('c-high-level', 'Cleaner in a teal uniform on a step ladder dusting a pendant light in an office.'),
  'c-deep-kitchen': nov10('c-deep-kitchen', 'Office kitchen with appliances pulled out while a cleaner in teal cleans behind them.'),
  'c-supervisor': nov10('c-supervisor', 'Person in a teal polo checking a tablet while walking through an office.'),
  'c-coats-office': nov10('c-coats-office', 'Quiet office in the morning with coats on chairs and coffee cups on desks.'),
  'c-glass-partition': nov10('c-glass-partition', 'Cleaner in a teal uniform using a squeegee on a glass meeting room partition.'),
  // Property, communal, void and post-construction
  'p-lobby': nov10('p-lobby', 'Cleaner in a teal uniform mopping the tiled entrance lobby of a mansion block.'),
  'p-stairwell': nov10('p-stairwell', 'Cleaner in a teal uniform wiping the handrail of a communal stairwell.'),
  'p-lift': nov10('p-lift', 'Gloved hand polishing the brushed steel wall of a residential lift.'),
  'p-bin-store': nov10('p-bin-store', 'Residential bin store with wheelie bins and a gloved hand wiping a lid.'),
  'p-key-hooks': nov10('p-key-hooks', 'Gloved hands wiping a wall of key hooks with coloured blank tags.'),
  'p-mansion-blocks': nov10('p-mansion-blocks', 'Row of red-brick mansion block entrances on a quiet London street.'),
  'p-report-photo': nov10('p-report-photo', 'Hand holding a phone to photograph a communal hallway.'),
  'p-portfolio-map': nov10('p-portfolio-map', 'Map of London with coloured pins beside a stack of property folders.'),
  'p-void-flat': nov10('p-void-flat', 'Empty flat hallway with clean floors, open doors and a staircase.'),
  'p-handover-keys': nov10('p-handover-keys', 'Two hands passing a set of keys in an empty flat.'),
  'p-build-dust': nov10('p-build-dust', 'Gloved hand wiping fine dust off a new white window sill.'),
  'p-high-windows': nov10('p-high-windows', 'Cleaner in a teal uniform on a step ladder cleaning tall windows in a new apartment.'),
  'p-film-peel': nov10('p-film-peel', 'Gloved hand peeling protective film off a stainless steel appliance.'),
  'p-snagging': nov10('p-snagging', 'Freshly painted wall with small blue markers and an inspection light.'),
  'p-trades': nov10('p-trades', 'Cleaning trolley, tools and hard hats by the door of a finished interior.'),
  'p-stone-floor': nov10('p-stone-floor', 'Hands using a pad on a polished marble floor.'),
  'p-plans': nov10('p-plans', 'Floor plans on a table with stone and timber material samples.'),
  'p-signoff': nov10('p-signoff', 'Two people signing a clipboard in a bright hallway.'),
  'p-van-street': nov10('p-van-street', 'Cleaner in a teal uniform unloading a plain white van on a London residential street.'),
  'p-postcode': nov10('p-postcode', 'Hand holding a phone showing a map with a single pin.'),
  'p-corridor': nov10('p-corridor', 'Long carpeted apartment-block corridor with doors on either side.'),
  // Process
  'g-site-review': nov10('g-site-review', 'Person in a teal polo walking through an empty property holding a tablet.'),
  'g-service-profile': nov10('g-service-profile', 'Hand marking a floor plan next to a weekly schedule sheet.'),
  'g-mobilisation': nov10('g-mobilisation', 'Cleaning trolley with folded teal cloths, spray bottles and a mop in a service corridor.'),
  'g-delivery': nov10('g-delivery', 'Two cleaners in teal uniforms working side by side in a large bright room.'),
  'g-quality-review': nov10('g-quality-review', 'Hand ticking a checklist on a clipboard in a bright kitchen.'),
  'g-enquiry': nov10('g-enquiry', 'Laptop on a desk beside a notebook in morning light.'),
  'g-assessment': nov10('g-assessment', 'Person crouching to photograph a stained carpet with a tablet.'),
  'g-scope-plan': nov10('g-scope-plan', 'Hand marking areas on a floor plan with a highlighter pen.'),
  'g-planner': nov10('g-planner', 'Wall planner board with coloured magnets in a small office.'),
  'g-walkthrough': nov10('g-walkthrough', 'Two people walking through a bright open-plan kitchen and living space.'),
  'g-phone-desk': nov10('g-phone-desk', 'Gloved hand wiping a desk beside a phone, a notebook and a cup of coffee.'),
  // Contact
  'k-supplies': nov10('k-supplies', 'Cleaner in a teal uniform arranging cleaning supplies on store-room shelves.'),
  'k-media': nov10('k-media', 'Camera, notebook, folded cloth and gloves on a wooden desk beside a window.'),
  // Earlier 6 November generated images, reused only on pages where they do not already appear
  'n6-complex-b': nov6('complex-b', 'Cleaner mopping a shared apartment-block lobby beside a lift.'),
  'n6-scope-and-planning': nov6('scope-and-planning', 'Cleaners inspecting a stair handrail with a clipboard.'),
  'n6-communal-lift-lobby': nov6('communal-lift-lobby', 'Shared apartment-block entrance with lift doors and a cleaning trolley.'),
  'n6-property-handover': nov6('property-handover', 'Empty apartment kitchen with open cupboards.'),
  'n6-workplace-touchpoints': nov6('workplace-touchpoints', 'Cleaner wiping a meeting table in a bright office.')
} satisfies Record<string, CardImage>;

export type CardImageId = keyof typeof cardLibrary;
export const cardImage = (id: CardImageId | undefined): CardImage | undefined => (id ? cardLibrary[id] : undefined);

export type OutcomeCardImagery = {
  /** One per outcome card, in order. */
  outcomes: CardImageId[];
  /** One per scope card, in order, followed by the 'Confirmed before work' card. */
  scope: CardImageId[];
  /** Supporting image beside a controlled-copy section that has no section imagery, by heading. */
  sections: Record<string, CardImageId>;
  /** Related-route thumbnail used instead of the destination hero when that hero is already on the page. */
  related?: Record<string, CardImageId>;
};

// Related-route destinations that are not outcome pages.
export const relatedRouteImagery: Record<string, CardImageId> = {
  '/cleaning-faqs/': 'k-media',
  '/terms-and-conditions/': 'g-scope-plan'
};

// reviews-case-studies is deliberately absent: its outcome, scope and section copy sits beside
// evidence wording, so it stays text-only apart from the related-route thumbnails.
export const outcomeCardImagery: Record<string, OutcomeCardImagery> = {
  'property-facilities-cleaning-london': {
    outcomes: ['p-van-street', 'p-mansion-blocks', 'p-report-photo'],
    scope: ['p-portfolio-map', 'p-key-hooks', 'c-supervisor', 'n6-property-handover'],
    sections: {
      'Cleaning Defined by the Property Outcome': 'p-void-flat',
      'Property Services': 'p-lobby',
      'When the Requirement Is More Complex': 'p-trades',
      'Why Property Teams Use HQC': 'p-stairwell'
    },
    related: { '/portfolio-cleaning-support-london/': 'p-corridor' }
  },
  'communal-area-cleaning-london': {
    outcomes: ['p-lobby', 'g-planner', 'p-report-photo'],
    scope: ['p-stairwell', 'p-lift', 'p-bin-store', 'n6-scope-and-planning'],
    sections: {
      'The Programme Is Built Around the Site': 'g-service-profile',
      'Not Every Area Needs the Same Frequency': 'c-touchpoints',
      'From Site Visit to Service Profile': 'g-site-review',
      'What Happens When Something Changes': 'g-phone-desk',
      'For Block Managers and Managing Agents': 'p-mansion-blocks',
      'Clear Scope. Practical Communication. Careful Delivery.': 'g-mobilisation',
      'Tell Us About the Building': 'p-corridor'
    }
  },
  'estate-letting-agent-cleaning-london': {
    outcomes: ['r-viewing-ready', 'p-handover-keys', 'g-phone-desk'],
    scope: ['p-void-flat', 'r-bathroom-reset', 'r-inventory', 'p-signoff'],
    sections: {
      'Less Time Chasing Individual Cleaning Arrangements': 'p-key-hooks',
      'We Do Not Force Every Instruction into End of Tenancy Cleaning': 'r-empty-flat',
      'Send Us the Requirement. We Help Define the Route.': 'g-enquiry',
      'Access and Communication Matter as Much as the Clean': 'r-front-door-keys',
      'For Repeated Instructions': 'p-portfolio-map',
      'End of Tenancy Remains a Separate Service': 'r-cupboard-inside',
      'Tell Us How Your Agency Works': 'p-corridor'
    },
    related: { '/move-in-void-property-cleaning-london/': 'r-boxes-movein', '/end-of-tenancy-cleaning-london/': 'r-skirting' }
  },
  'move-in-void-property-cleaning-london': {
    outcomes: ['r-empty-flat', 'p-handover-keys', 'p-snagging'],
    scope: ['r-skirting', 'r-bathroom-reset', 'r-fridge', 'r-inventory'],
    sections: {
      'The Question Is: What Must the Property Be Ready For?': 'p-void-flat',
      'When a Void Property May Need More Than Routine Cleaning': 'r-shower-glass',
      'Void Property Cleaning Is Not the Same as Private Move-In Reset™': 'r-boxes-movein',
      'Access Is Often Easier, but Coordination Still Matters': 'p-key-hooks',
      'If Works Have Recently Taken Place': 'p-build-dust'
    }
  },
  'end-of-tenancy-cleaning-london': {
    outcomes: ['r-inventory', 'r-skirting', 'r-oven-inside'],
    scope: ['r-kitchen-wipe', 'r-fridge', 'p-van-street', 'p-handover-keys'],
    sections: {
      'The Outcome Is Handover Readiness': 'r-empty-flat',
      'What May Be Included': 'r-cupboard-inside',
      'Specialist Services Are Quoted Separately': 'r-sofa-vacuum',
      'We Do Not Guarantee Deposit Return': 'p-void-flat',
      'Property Condition Can Change the Scope': 'r-shower-glass',
      'For Agents and Property Managers': 'p-key-hooks',
      'What Happens Next': 'r-viewing-ready'
    }
  },
  'post-construction-cleaning-london': {
    outcomes: ['p-build-dust', 'p-snagging', 'p-signoff'],
    scope: ['p-film-peel', 'p-high-windows', 'p-trades', 'g-walkthrough'],
    sections: {
      'Post-Construction Cleaning Is Project Work': 'p-plans',
      'What the Assessment Considers': 'n6-scope-and-planning',
      'A Planned Cleaning Sequence': 'g-planner',
      'What We Do Not Treat as Routine Cleaning': 'c-floor-scrubber',
      'Protecting New Finishes Matters': 'p-stone-floor',
      'For Developers, Contractors and Property Professionals': 'g-site-review',
      'No Unlimited “Builders Clean” Promise': 'g-scope-plan'
    },
    related: { '/complex-property-cleaning-london/': 'n6-complex-b' }
  },
  'portfolio-cleaning-support-london': {
    outcomes: ['p-mansion-blocks', 'g-phone-desk', 'g-mobilisation'],
    scope: ['p-portfolio-map', 'p-key-hooks', 'p-report-photo', 'n6-property-handover'],
    sections: {
      'Designed for Repeat Instructions': 'p-stairwell',
      'Consistency Does Not Mean Every Property Gets the Same Clean': 'p-void-flat',
      'Repeat Allocation and Team Familiarity': 'p-lobby',
      'Portfolio Visibility': 'g-planner',
      'When a Portfolio Requirement Becomes Complex': 'p-plans',
      'How We Start': 'g-service-profile'
    }
  },
  'commercial-cleaning-london': {
    outcomes: ['c-after-hours', 'c-supervisor', 'c-deep-kitchen'],
    scope: ['c-coats-office', 'c-washroom', 'c-reception', 'c-touchpoints'],
    sections: {
      'Which Commercial Route Do You Need?': 'c-desks',
      'Who We Can Support': 'c-meeting-reset',
      'One-Off Commercial Cleaning Is Assessed Separately': 'c-high-level',
      'Labour-Based Commercial Quotations': 'c-floor-scrubber',
      'Site Assessment': 'n6-scope-and-planning',
      'From Requirement to Delivery': 'c-staff-kitchen',
      'Tell Us About the Site': 'c-glass-partition'
    },
    related: { '/office-cleaning-london/': 'c-waste', '/commercial-deep-cleaning-london/': 'k-supplies' }
  },
  'office-cleaning-london': {
    outcomes: ['c-coats-office', 'c-after-hours', 'c-supervisor'],
    scope: ['c-desks', 'c-staff-kitchen', 'c-touchpoints', 'c-meeting-reset'],
    sections: {
      'From Site Review to Mobilisation': 'g-site-review',
      'Not Every Task Needs the Same Frequency': 'c-waste',
      'Commercial Deep Cleaning When Routine Maintenance Is Not Enough': 'c-deep-kitchen',
      'Clear Scope. Labour-Based Quotations. Careful Delivery.': 'c-glass-partition',
      'Changing Cleaning Provider?': 'g-mobilisation',
      'Tell Us About Your Workplace': 'c-reception'
    },
    related: { '/commercial-cleaning-london/': 'c-floor-scrubber', '/how-we-work/': 'g-walkthrough' }
  },
  'commercial-deep-cleaning-london': {
    outcomes: ['c-floor-scrubber', 'c-high-level', 'g-walkthrough'],
    scope: ['c-staff-kitchen', 'k-supplies', 'c-after-hours', 'c-meeting-reset'],
    sections: {
      'The Scope May Be Phased': 'c-coats-office',
      'What Commercial Deep Cleaning May Cover': 'c-deep-kitchen',
      'What It Does Not Automatically Include': 'c-washroom',
      'Commercial Deep Cleaning vs Post-Construction™': 'p-build-dust',
      'Commercial Deep Cleaning vs Routine Office Cleaning': 'c-desks'
    },
    related: { '/commercial-cleaning-london/': 'c-glass-partition' }
  },
  'home-cleaning-london': {
    outcomes: ['r-routine-visit', 'r-checklist-home', 'r-pets-home'],
    scope: ['r-oven-inside', 'r-kitchen-wipe', 'r-front-door-keys', 'r-bathroom-shine'],
    sections: {
      'When Essential Clean™ Is Not the Right Service': 'r-shower-glass',
      'We Do Not Price Bedrooms Alone': 'r-bed-made',
      'Not Sure What You Need?': 'r-hallway-floor',
      'Cleaning with Clear Boundaries': 'r-sofa-vacuum',
      'Find the Right Cleaning Route for Your Home': 'r-living-dust'
    }
  },
  'essential-clean-london': {
    outcomes: ['r-living-dust', 'r-routine-visit', 'r-checklist-home'],
    scope: ['r-kitchen-wipe', 'r-bed-made', 'r-pets-home', 'r-bathroom-shine'],
    sections: {
      'One-Off, Weekly or Fortnightly': 'r-hallway-floor',
      '30% Off Your First Clean for Eligible New Recurring Clients': 'r-bathroom-reset',
      'What We Agree Before the Clean': 'r-cupboard-inside',
      'When We May Recommend Deep Clean™ Instead': 'r-oven-inside',
      'How We Price Essential Clean™': 'r-skirting',
      'What Happens Next': 'r-sofa-vacuum'
    }
  },
  'deep-cleaning-london': {
    outcomes: ['r-oven-inside', 'r-checklist-home', 'r-bathroom-shine'],
    scope: ['r-shower-glass', 'r-fridge', 'k-supplies', 'r-skirting'],
    sections: {
      'What Deep Clean™ Does Not Automatically Include': 'r-sofa-vacuum',
      'We Assess the Property Before Confirming the Price': 'g-site-review',
      'Photos and Video Help Us Quote More Accurately': 'g-assessment'
    }
  },
  'move-in-cleaning-london': {
    outcomes: ['r-boxes-movein', 'r-bathroom-shine', 'r-front-door-keys'],
    scope: ['p-handover-keys', 'r-empty-flat', 'r-cupboard-inside', 'g-quality-review'],
    sections: {
      'Who the Service Is For': 'r-hallway-floor',
      'What We Need to Know': 'g-enquiry',
      'What Move-In Reset™ May Include': 'r-fridge',
      'Move-In Reset™ Is Different from End of Tenancy™': 'r-inventory',
      'What Happens Next': 'r-bed-made'
    }
  },
  'complex-property-cleaning-london': {
    outcomes: ['p-plans', 'p-stone-floor', 'g-walkthrough'],
    scope: ['g-scope-plan', 'p-trades', 'p-signoff', 'p-snagging'],
    sections: {
      'Large Does Not Automatically Mean Complex': 'p-mansion-blocks',
      'The HQC Complex Service Assessment & Delivery System™': 'g-assessment',
      'What the Assessment May Involve': 'k-media',
      'Specialist Work Is Separated from Routine Cleaning': 'p-high-windows',
      'Confidentiality and Access': 'c-reception',
      'Complex Cleaning Is Still Defined by the Outcome': 'n6-complex-b'
    }
  },
  'about-high-quality-clean': {
    outcomes: ['g-quality-review', 'g-phone-desk', 'r-viewing-ready'],
    scope: ['g-enquiry', 'n6-scope-and-planning', 'p-snagging', 'n6-property-handover'],
    sections: {
      'Why HQC Exists': 'r-living-dust',
      "Pedro's Vision": 'g-delivery',
      'From Individual Cleaning Jobs to a Service Architecture': 'g-service-profile',
      'Clear Scope': 'p-plans',
      'Labour Matters': 'c-high-level',
      'Standards Behind the Service': 'k-supplies',
      'A Practical Approach to Quality': 'c-supervisor',
      'Where HQC Is Going': 'n6-complex-b'
    }
  },
  'why-choose-hqc': {
    outcomes: ['p-plans', 'g-delivery', 'r-bathroom-reset'],
    scope: ['p-report-photo', 'r-checklist-home', 'k-media', 'p-signoff'],
    sections: {
      'The Service Matches the Need': 'r-routine-visit',
      'The Labour Is Considered Properly': 'g-mobilisation',
      'We Protect Service Boundaries': 'p-stone-floor',
      'Professional Controls Behind the Service': 'c-supervisor'
    }
  },
  'how-we-work': {
    outcomes: ['g-enquiry', 'g-scope-plan', 'g-walkthrough'],
    scope: ['g-phone-desk', 'g-assessment', 'g-planner', 'g-quality-review'],
    sections: {
      '1. Tell Us What You Need to Achieve': 'p-postcode',
      '2. We Identify the Correct Service': 'g-service-profile',
      '4. We Confirm the Price or Proposal': 'p-signoff',
      '5. We Prepare the Right Delivery Route': 'g-mobilisation',
      'Different Services Follow Different Routes': 'g-delivery'
    }
  },
  'cleaning-prices-london': {
    outcomes: ['g-delivery', 'g-assessment', 'r-checklist-home'],
    scope: ['r-empty-flat', 'p-van-street', 'p-stone-floor', 'g-quality-review'],
    sections: {
      'What Affects the Price?': 'r-kitchen-wipe',
      'Essential Clean™ Pricing': 'r-living-dust',
      'Quoted Residential Services': 'r-oven-inside',
      'Commercial Pricing': 'c-desks',
      'Why Some Services Require Assessment': 'p-trades',
      'Extras Are Separated Where Appropriate': 'r-fridge'
    }
  },
  'areas-we-cover': {
    outcomes: ['p-postcode', 'n6-communal-lift-lobby', 'p-van-street'],
    scope: ['p-mansion-blocks', 'r-hallway-floor', 'r-front-door-keys', 'n6-property-handover'],
    sections: {
      'Selected Surrey Coverage': 'r-routine-visit',
      'Not Every Service Has the Same Coverage': 'p-lobby'
    }
  },
  'cleaning-services-east-london': {
    outcomes: ['p-van-street', 'p-postcode', 'p-stairwell'],
    scope: ['p-portfolio-map', 'r-viewing-ready', 'c-reception', 'n6-scope-and-planning'],
    sections: {
      'Home Cleaning in East London': 'r-kitchen-wipe',
      'Property & Facilities Cleaning in East London': 'p-corridor',
      'Workplace and Commercial Cleaning': 'c-glass-partition',
      'Shoreditch and Spitalfields': 'c-coats-office',
      'Canary Wharf': 'c-after-hours'
    }
  }
};

// Homepage process cards ('Clarity before anyone picks up a cloth'), by card title.
export const homeProcessImagery: Record<string, CardImageId> = {
  'Site review': 'g-site-review',
  'Service profile': 'g-service-profile',
  Mobilisation: 'g-mobilisation',
  Delivery: 'g-delivery',
  'Quality review': 'g-quality-review'
};

// Homepage complex-service step cards, by step.
export const homeComplexStepImagery: Record<string, CardImageId> = {
  Qualification: 'g-enquiry',
  Assessment: 'g-assessment',
  'Defined scope': 'g-scope-plan',
  'Delivery plan': 'g-planner',
  'Controlled delivery': 'p-high-windows',
  Handover: 'g-walkthrough'
};

// Contact page information cards, by card heading.
export const contactCardImagery: Record<string, CardImageId> = {
  'Existing Clients': 'r-routine-visit',
  'Suppliers and Subcontractors': 'k-supplies',
  'Media, Partnerships and Other Enquiries': 'k-media',
  'Assessment Media': 'p-report-photo',
  'Service Area Questions': 'p-postcode',
  'Need a Cleaning Quote Rather Than General Support?': 'g-enquiry'
};
