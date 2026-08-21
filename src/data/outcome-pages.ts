export type OutcomePageSection = {
  title: string;
  copy?: string[];
  items?: { title: string; copy: string; href?: string; cta?: string }[];
  presentation?: 'cards' | 'lifecycle' | 'process' | 'profile';
};

export type OutcomePage = {
  slug: string;
  cluster: string;
  title: string;
  seoTitle?: string;
  eyebrow: string;
  primaryKeyword?: string;
  description: string;
  message: string;
  audience: string;
  primaryCta: string;
  primaryHref: string;
  secondaryCta: string;
  secondaryHref: string;
  proof: string[];
  related: { label: string; href: string }[];
  sections?: OutcomePageSection[];
  assessment?: boolean;
};

const quote = '/request-a-quote/';
const selector = '/#find-my-service';

export const outcomePages: OutcomePage[] = [
  {
    slug: 'property-facilities-cleaning-london',
    cluster: 'Property & Facilities',
    title: 'Cleaning Support for London Property Managers, Agents and Facilities Teams',
    seoTitle: 'Property Management Cleaning London | HQC',
    eyebrow: 'For managed properties, portfolios and projects',
    primaryKeyword: 'property management cleaning London',
    description: 'Cleaning support for London property managers, agents, developers and portfolio teams. One partner for turnovers, communal areas, post-works cleaning and repeat property requirements.',
    message: 'One property may need a tenancy handover. Another may need a move-in reset, communal cleaning or post-construction support. HQC gives property professionals one controlled route for coordinating different cleaning requirements without forcing every property into the same service.',
    audience: 'Property managers, facilities managers, managing agents, developers, block managers and multi-property landlords.',
    primaryCta: 'Discuss Your Property Requirements',
    primaryHref: `${quote}?route=commercial&buyer=property`,
    secondaryCta: 'Request a Site or Portfolio Assessment',
    secondaryHref: `${quote}?route=commercial&buyer=property&intent=site-assessment`,
    proof: ['A defined scope before mobilisation', 'One route for repeat property instructions', 'Site, access and reporting requirements captured from the start'],
    related: [
      { label: 'Communal area cleaning', href: '/communal-area-cleaning-london/' },
      { label: 'Estate and letting agent support', href: '/estate-letting-agent-cleaning-london/' },
      { label: 'Portfolio cleaning support', href: '/portfolio-cleaning-support-london/' }
    ],
    sections: [
      { title: 'One Partner Across the Property Lifecycle', copy: ['HQC can support estate and letting agents, property managers, block managers, developers, multi-property landlords, relocation teams, family offices, facilities and operations teams.', 'Our role can range from a single property instruction to ongoing cleaning support across a portfolio.'] },
      { title: 'Cleaning Defined by the Property Outcome', presentation: 'lifecycle', items: [
        { title: 'Prepare for occupation', copy: 'Move-In Reset™ and void-property preparation.', href: '/move-in-void-property-cleaning-london/', cta: 'Explore move-in and void cleaning' },
        { title: 'Prepare for handover', copy: 'End of Tenancy™ cleaning with a defined handover scope.', href: '/end-of-tenancy-cleaning-london/', cta: 'Explore end of tenancy cleaning' },
        { title: 'Remove construction residue', copy: 'Post-Construction™ cleaning after refurbishment, fit-out or construction work.', href: '/post-construction-cleaning-london/', cta: 'Explore post-construction cleaning' },
        { title: 'Maintain shared spaces', copy: 'Recurring communal-area programmes with agreed access and checks.', href: '/communal-area-cleaning-london/', cta: 'Explore communal-area cleaning' },
        { title: 'Coordinate repeat requirements', copy: 'Portfolio support for repeated instructions across multiple properties.', href: '/portfolio-cleaning-support-london/', cta: 'Explore portfolio support' },
        { title: 'Manage unusual or complex work', copy: 'A structured assessment before scope, labour and price are confirmed.', href: '/complex-property-cleaning-london/', cta: 'Request an assessment' }
      ] },
      { title: 'A Clearer Way to Mobilise Recurring Property Cleaning', presentation: 'profile', copy: ['Where a recurring site or building requires a formal programme, HQC can establish a Site Service Profile covering areas, tasks, frequencies, access, equipment, site requirements, communication and quality checks.'] },
      { title: 'When the Requirement Is More Complex', copy: ['Large properties, unusual finishes, specialist amenities, access restrictions, live construction environments or multi-supplier projects may require a formal assessment before HQC confirms the service.', 'That assessment helps define scope, labour, programme, specialist involvement, practical controls and handover.'] }
    ]
  },
  {
    slug: 'communal-area-cleaning-london',
    cluster: 'Property & Facilities',
    title: 'Communal Area Cleaning in London',
    eyebrow: 'Recurring cleaning for shared areas',
    primaryKeyword: 'communal area cleaning London',
    description: 'Agreed areas, frequencies, access, reporting and quality checks for London residential blocks and managed buildings.',
    message: 'Agreed areas, frequencies, access, reporting and quality checks.',
    audience: 'Block managers, managing agents, resident management companies, freeholders and facilities managers.',
    primaryCta: 'Request a Communal Cleaning Proposal',
    primaryHref: `${quote}?route=commercial&service=communal`,
    secondaryCta: 'Arrange a Site Visit',
    secondaryHref: `${quote}?route=complex&service=communal`,
    proof: ['Site-specific service profile', 'Access and communication controls', 'Agreed inspection and reporting process'],
    related: [{ label: 'Property and facilities cleaning', href: '/property-facilities-cleaning-london/' }, { label: 'How we work', href: '/how-we-work/' }]
  },
  {
    slug: 'estate-letting-agent-cleaning-london',
    cluster: 'Property & Facilities',
    title: 'Cleaning Support for Estate and Letting Agents',
    eyebrow: 'A coordinated route for agency-managed work',
    primaryKeyword: 'cleaning services for letting agents London',
    description: 'One partner for turnovers, voids, move-ins, viewings and selected portfolio support across London.',
    message: 'One partner for turnovers, voids, move-ins, viewings and selected portfolio support.',
    audience: 'Estate agents, letting agents, property administrators and branch operations teams.',
    primaryCta: 'Discuss Agency Cleaning Support',
    primaryHref: `${quote}?route=commercial&buyer=agency`,
    secondaryCta: 'Send Us a Property Requirement',
    secondaryHref: `${quote}?route=commercial&buyer=agency`,
    proof: ['A single route for repeat instructions', 'Property details captured before quoting', 'Clear distinction between agency and private-client requirements'],
    related: [{ label: 'Move-in and void cleaning', href: '/move-in-void-property-cleaning-london/' }, { label: 'End of tenancy cleaning', href: '/end-of-tenancy-cleaning-london/' }]
  },
  {
    slug: 'move-in-void-property-cleaning-london',
    cluster: 'Property & Facilities',
    title: 'Move-In and Void Property Cleaning in London',
    eyebrow: 'Property readiness for professional buyers',
    primaryKeyword: 'void property cleaning London',
    description: 'Prepare empty or newly available properties for occupation, letting or presentation.',
    message: 'Prepare empty or newly available properties for occupation, letting or presentation.',
    audience: 'Agents, property managers, landlords, developers and relocation teams.',
    primaryCta: 'Request a Property Reset Quote',
    primaryHref: `${quote}?route=commercial&buyer=property&service=void`,
    secondaryCta: 'Send Property Details',
    secondaryHref: `${quote}?route=commercial&buyer=property&service=void`,
    proof: ['Condition, access and timing reviewed first', 'Before-and-after evidence where permitted', 'A scoped handover rather than a generic room count'],
    related: [{ label: 'Property and facilities cleaning', href: '/property-facilities-cleaning-london/' }, { label: 'Move-In Reset for private clients', href: '/move-in-cleaning-london/' }]
  },
  {
    slug: 'end-of-tenancy-cleaning-london',
    cluster: 'Shared high-intent service',
    title: 'End of Tenancy Cleaning in London',
    eyebrow: 'For tenants, landlords and property professionals',
    primaryKeyword: 'end of tenancy cleaning London',
    description: 'A clearly scoped handover clean without false deposit or inventory guarantees.',
    message: 'A clearly scoped handover clean, planned around the property condition and access requirements.',
    audience: 'Tenants, landlords, letting agents and property managers.',
    primaryCta: 'Request an End of Tenancy Quote',
    primaryHref: `${quote}?route=residential&service=end-of-tenancy`,
    secondaryCta: 'Check Your Property Requirements',
    secondaryHref: '/cleaning-faqs/',
    proof: ['Appliances and exclusions made clear', 'Property condition reviewed before quoting', 'No unsupported deposit-return promise'],
    related: [{ label: 'How HQC pricing works', href: '/cleaning-prices-london/' }, { label: 'Home cleaning', href: '/home-cleaning-london/' }]
  },
  {
    slug: 'post-construction-cleaning-london',
    cluster: 'Shared high-intent service',
    title: 'Post-Construction Cleaning in London',
    eyebrow: 'After building, renovation and fit-out work',
    primaryKeyword: 'post construction cleaning London',
    description: 'Remove building dust and residue through a scoped, assessed delivery plan.',
    message: 'Remove building dust and residue through a scoped, assessed delivery plan.',
    audience: 'Developers, contractors, project managers, designers, landlords and homeowners.',
    primaryCta: 'Request a Post-Construction Assessment',
    primaryHref: `${quote}?route=complex&service=post-construction`,
    secondaryCta: 'Send Project Details',
    secondaryHref: `${quote}?route=complex&service=post-construction`,
    proof: ['Project stage and access reviewed', 'Labour and specialist requirements assessed', 'Phased delivery considered where appropriate'],
    related: [{ label: 'Complex property cleaning', href: '/complex-property-cleaning-london/' }, { label: 'Property and facilities cleaning', href: '/property-facilities-cleaning-london/' }],
    assessment: true
  },
  {
    slug: 'portfolio-cleaning-support-london',
    cluster: 'Property & Facilities',
    title: 'Portfolio Cleaning Support in London',
    eyebrow: 'Coordinated repeat delivery',
    primaryKeyword: 'property portfolio cleaning London',
    description: 'Central communication, consistent standards and coordinated cleaning across multiple London properties.',
    message: 'Central communication, consistent standards and coordinated repeat delivery.',
    audience: 'Multi-property landlords, portfolio managers, agencies, family offices and developers.',
    primaryCta: 'Discuss Your Portfolio Requirements',
    primaryHref: `${quote}?route=commercial&buyer=property&service=portfolio`,
    secondaryCta: 'Request a Partnership Conversation',
    secondaryHref: `${quote}?route=commercial&buyer=property&service=portfolio`,
    proof: ['A central point of communication', 'Repeat allocation coordinated property by property', 'Requirements retained in the customer record'],
    related: [{ label: 'Property and facilities cleaning', href: '/property-facilities-cleaning-london/' }, { label: 'Reviews and case studies', href: '/reviews-case-studies/' }]
  },
  {
    slug: 'commercial-cleaning-london',
    cluster: 'Workplaces & Commercial Sites',
    title: 'Workplaces and Commercial Cleaning in London',
    eyebrow: 'For workplaces and selected commercial sites',
    primaryKeyword: 'commercial cleaning London',
    description: 'Commercial cleaning organised around the site, required outcome and operating conditions.',
    message: 'Commercial cleaning organised around the site, required outcome and operating conditions.',
    audience: 'Office managers, operations managers, facilities contacts, studios, charities and selected client-facing premises.',
    primaryCta: 'Discuss Commercial Cleaning',
    primaryHref: `${quote}?route=commercial`,
    secondaryCta: 'Request a Site Assessment',
    secondaryHref: `${quote}?route=complex&buyer=commercial`,
    proof: ['Site details captured before proposal', 'Operating hours and access considered', 'A service profile agreed before mobilisation'],
    related: [{ label: 'Office cleaning', href: '/office-cleaning-london/' }, { label: 'Commercial deep cleaning', href: '/commercial-deep-cleaning-london/' }]
  },
  {
    slug: 'office-cleaning-london',
    cluster: 'Workplaces & Commercial Sites',
    title: 'Office Cleaning Programmes Built Around Your Workplace',
    seoTitle: 'Office Cleaning London | Workplace Cleaning Programmes | HQC',
    eyebrow: 'Recurring office cleaning programmes',
    primaryKeyword: 'office cleaning London',
    description: 'Office cleaning programmes built around your workplace, with an agreed service profile and mobilisation plan.',
    message: 'A good office-cleaning service should reflect how the workplace is used, when cleaning can take place and what standard must be maintained. HQC develops recurring office cleaning around an agreed service profile rather than relying on a generic checklist.',
    audience: 'Office managers, practice managers, operations teams, founders and facilities managers.',
    primaryCta: 'Request an Office Cleaning Proposal',
    primaryHref: `${quote}?route=commercial&service=office`,
    secondaryCta: 'Arrange a Site Visit',
    secondaryHref: `${quote}?route=commercial&service=office&intent=site-visit`,
    proof: ['Area, hours and frequency recorded', 'Incumbent and TUPE context captured where relevant', 'Desired start date and mobilisation requirements reviewed'],
    related: [{ label: 'Commercial cleaning', href: '/commercial-cleaning-london/' }, { label: 'How we work', href: '/how-we-work/' }, { label: 'How we price', href: '/cleaning-prices-london/' }],
    sections: [
      { title: 'Cleaning That Fits the Way Your Workplace Operates', copy: ['Every office is different. The cleaning requirement may depend on staff numbers, operating hours, kitchens and tea points, washrooms, meeting rooms, client-facing areas, flooring, waste arrangements, security, access windows and periodic requirements.', 'We use that information to establish an appropriate programme.'] },
      { title: 'What an HQC Office Cleaning Programme Can Cover', items: [
        { title: 'Workspaces and shared areas', copy: 'Desks where authorised, meeting rooms, reception areas and circulation areas.' },
        { title: 'Core facilities', copy: 'Washrooms, kitchens, tea points, floors, bins and agreed waste handling.' },
        { title: 'Planned detail', copy: 'Internal glass, touchpoints, periodic detail cleaning and selected specialist services.' }
      ] },
      { title: 'From Site Review to Mobilisation', presentation: 'process', items: [
        { title: 'Site Review', copy: 'We review the site, operating pattern and required outcome.' },
        { title: 'Service Profile', copy: 'We agree the areas, tasks and frequencies.' },
        { title: 'Mobilisation', copy: 'We establish access, cleaner allocation, equipment and practical requirements.' },
        { title: 'Delivery', copy: 'The team receives the relevant site instructions and begins the agreed programme.' },
        { title: 'Review', copy: 'Cleaning quality is reviewed as requirements change.' }
      ] },
      { title: 'Clear Scope. Labour-Based Quotations. Careful Delivery.', copy: ['A commercial quotation considers the agreed scope, site size and layout, frequency, access, operating hours, labour required, equipment, periodic work, specialist services and practical site complexity.', 'HQC does not publish a universal hourly or square-metre price and pretend every workplace requires the same level of work.'] }
    ]
  },
  {
    slug: 'commercial-deep-cleaning-london',
    cluster: 'Workplaces & Commercial Sites',
    title: 'Commercial Deep Cleaning in London',
    eyebrow: 'One-off restoration and reset work',
    primaryKeyword: 'commercial deep cleaning London',
    description: 'Restore a workplace or commercial site through assessed labour, access and delivery planning.',
    message: 'Restore a workplace or commercial site through assessed labour, access and delivery planning.',
    audience: 'Facilities teams, office managers, landlords, project managers and operators.',
    primaryCta: 'Request a Commercial Deep-Clean Assessment',
    primaryHref: `${quote}?route=complex&service=commercial-deep`,
    secondaryCta: 'Send Site Details',
    secondaryHref: `${quote}?route=commercial&service=commercial-deep`,
    proof: ['Condition and scope reviewed first', 'Access and phased work considered', 'Quoted separately from recurring office programmes'],
    related: [{ label: 'Commercial cleaning', href: '/commercial-cleaning-london/' }, { label: 'Post-construction cleaning', href: '/post-construction-cleaning-london/' }],
    assessment: true
  },
  {
    slug: 'home-cleaning-london',
    cluster: 'Homes & Private Clients',
    title: 'Home Cleaning Starts with the Result You Need',
    seoTitle: 'Home Cleaning Services London | High Quality Clean',
    eyebrow: 'Find the service that matches the outcome',
    primaryKeyword: 'home cleaning services London',
    description: 'Tell us the result you need and HQC will route you to the right home cleaning service.',
    message: 'Some homes need regular maintenance. Others need restoring after build-up, preparing before a move or clearing residue after building work. HQC helps you identify the right service before you book.',
    audience: 'Homeowners, tenants, busy professionals, household managers and private clients.',
    primaryCta: 'Find the Right Home Cleaning Service',
    primaryHref: selector,
    secondaryCta: 'Request a Quote',
    secondaryHref: `${quote}?route=residential`,
    proof: ['Essential Clean for maintenance-ready homes', 'Manual quotes for restoration and moving services', 'Assessment route for large or complex properties'],
    related: [{ label: 'Essential Clean', href: '/essential-clean-london/' }, { label: 'Deep cleaning', href: '/deep-cleaning-london/' }, { label: 'Move-In Reset', href: '/move-in-cleaning-london/' }],
    sections: [
      { title: 'Which Home Cleaning Service Is Right for You?', items: [
        { title: 'Keep my home consistently clean — Essential Clean™', copy: 'For maintenance-ready homes requiring a one-off, weekly or fortnightly maintenance service.', href: '/essential-clean-london/', cta: 'Check Essential Clean™ suitability' },
        { title: 'My home needs more attention — Deep Clean™', copy: 'For build-up, neglected detail and homes that require restoration before maintenance cleaning is appropriate.', href: '/deep-cleaning-london/', cta: 'Request a deep-clean quote' },
        { title: 'I am moving into a property — Move-In Reset™', copy: 'For preparing a home before occupation.', href: '/move-in-cleaning-london/', cta: 'Request a Move-In Reset™ quote' },
        { title: 'I am moving out — End of Tenancy™', copy: 'For preparing a property for tenancy handover.', href: '/end-of-tenancy-cleaning-london/', cta: 'Request an end of tenancy quote' },
        { title: 'Building work has finished — Post-Construction™', copy: 'For appropriate construction and refurbishment residue.', href: '/post-construction-cleaning-london/', cta: 'Request a post-construction assessment' },
        { title: 'The property is large, unusual or complex', copy: 'For requirements that need assessment before scope and price can be confirmed.', href: '/complex-property-cleaning-london/', cta: 'Request a complex-service assessment' }
      ] },
      { title: 'Essential Clean™: Maintain and Improve', copy: ['Essential Clean™ is designed for homes that are already suitable for maintenance cleaning. Direct online booking may be available for maintenance-ready one-off, weekly and fortnightly cleans.', 'Eligible new weekly and fortnightly clients can receive 30% off their first Essential Clean™ with a minimum three-month recurring commitment. A one-off Essential Clean™ does not qualify for that recurring-client offer.'] },
      { title: 'When Essential Clean™ Is Not the Right Service', copy: ['HQC may recommend a different service where there is heavy build-up, neglected areas, restoration-level cleaning, an end-of-tenancy requirement, a move-in requirement, construction residue, specialist cleaning or unusual property complexity.', 'That protects both the client and the cleaning team from beginning with a service that does not match the actual requirement.'] },
      { title: 'We Do Not Price Bedrooms Alone', copy: ['Property size matters, but it does not tell the whole story. Bathrooms, additional rooms, contents, current condition, floors, access and specialist requirements can all change the work required to achieve the agreed outcome.'] }
    ]
  },
  {
    slug: 'essential-clean-london',
    cluster: 'Homes & Private Clients',
    title: 'Essential Clean™ for London Homes',
    eyebrow: 'A recurring service assessed for suitability',
    primaryKeyword: 'regular home cleaning London',
    description: 'A weekly or fortnightly cleaning service for suitable, maintenance-ready London homes.',
    message: 'Maintain and improve a suitable home through a clear recurring service.',
    audience: 'Clients seeking weekly or fortnightly maintenance cleaning for a suitable home.',
    primaryCta: 'Request an Essential Clean Suitability Review',
    primaryHref: `${quote}?route=residential&service=essential-clean&buyer=home`,
    secondaryCta: 'View the 30% First-Clean Offer',
    secondaryHref: '/offer/',
    proof: ['Weekly or fortnightly commitment', 'Heavy build-up is routed to manual review', '30% first-clean offer requires a three-month commitment'],
    related: [{ label: 'Home cleaning', href: '/home-cleaning-london/' }, { label: 'How HQC pricing works', href: '/cleaning-prices-london/' }, { label: 'Cleaning FAQs', href: '/cleaning-faqs/' }]
  },
  {
    slug: 'deep-cleaning-london',
    cluster: 'Homes & Private Clients',
    title: 'Deep Cleaning for London Homes',
    eyebrow: 'Restoration beyond routine maintenance',
    primaryKeyword: 'deep cleaning London',
    description: 'Deep cleaning for London homes that need more than routine maintenance.',
    message: 'Deep cleaning for London homes that need more than routine maintenance.',
    audience: 'Homeowners, tenants, household managers and property professionals with homes needing restoration.',
    primaryCta: 'Request a Deep-Clean Quote',
    primaryHref: `${quote}?route=residential&service=deep-clean`,
    secondaryCta: 'Tell Us About the Property Condition',
    secondaryHref: `${quote}?route=residential&service=deep-clean`,
    proof: ['Full address and property condition reviewed', 'Photos or video can support assessment', 'Parking, access and exclusions captured'],
    related: [{ label: 'Home cleaning', href: '/home-cleaning-london/' }, { label: 'Essential Clean', href: '/essential-clean-london/' }, { label: 'How we price', href: '/cleaning-prices-london/' }]
  },
  {
    slug: 'move-in-cleaning-london',
    cluster: 'Homes & Private Clients',
    title: 'Move-In Reset™ Cleaning in London',
    eyebrow: 'Prepare your home before occupation',
    primaryKeyword: 'move in cleaning London',
    description: 'Prepare the home for occupation before belongings and routines take over.',
    message: 'Prepare the home for occupation before belongings and routines take over.',
    audience: 'Homebuyers, tenants, relocating families, household managers and private clients.',
    primaryCta: 'Request a Move-In Reset™ Quote',
    primaryHref: `${quote}?route=residential&service=move-in`,
    secondaryCta: 'Send Your Move Date and Property Details',
    secondaryHref: `${quote}?route=residential&service=move-in`,
    proof: ['Move date and access reviewed', 'Property condition captured before quotation', 'Separate from professional void-property workflows'],
    related: [{ label: 'Home cleaning', href: '/home-cleaning-london/' }, { label: 'How we work', href: '/how-we-work/' }]
  },
  {
    slug: 'complex-property-cleaning-london',
    cluster: 'Complex Services',
    title: 'Complex and Executive Property Cleaning',
    eyebrow: 'For requirements outside ordinary service routes',
    primaryKeyword: 'large property cleaning London',
    description: 'Assessment-led cleaning for large properties, executive homes and complex projects in London and selected locations beyond.',
    message: 'When routine cleaning is not enough, HQC assesses the scope, labour, specialists, programme and handover.',
    audience: 'Private clients, household managers, family offices, developers, designers, project managers and property representatives.',
    primaryCta: 'Request a Complex Service Assessment',
    primaryHref: `${quote}?route=complex`,
    secondaryCta: 'Discuss the Property or Project',
    secondaryHref: '/contact/',
    proof: ['Floor plans, photos and video accepted for assessment', 'Labour and specialist needs considered', 'Programme and handover defined before delivery'],
    related: [{ label: 'Home cleaning', href: '/home-cleaning-london/' }, { label: 'Property and facilities cleaning', href: '/property-facilities-cleaning-london/' }, { label: 'Post-construction cleaning', href: '/post-construction-cleaning-london/' }],
    assessment: true
  },
  {
    slug: 'about-high-quality-clean',
    cluster: 'About HQC',
    title: 'About High Quality Clean',
    eyebrow: 'Cleaning Defined by the Outcome',
    primaryKeyword: 'High Quality Clean London',
    description: 'Meet Pedro and learn how High Quality Clean removes uncertainty from choosing and organising the right cleaning service.',
    message: 'Pedro built HQC to remove uncertainty from choosing and organising the right cleaning service.',
    audience: 'Clients, partners and prospective team members.',
    primaryCta: 'Discuss Your Cleaning Requirement',
    primaryHref: quote,
    secondaryCta: 'See How HQC Works',
    secondaryHref: '/how-we-work/',
    proof: ['Clear scope and labour-based quotations', 'An outcome-led route for homes, workplaces and managed property', 'Founder information is kept separate from service scope'],
    related: [{ label: 'Why choose HQC', href: '/why-choose-hqc/' }, { label: 'Reviews and case studies', href: '/reviews-case-studies/' }]
  },
  {
    slug: 'why-choose-hqc',
    cluster: 'Trust',
    title: 'Why Choose High Quality Clean?',
    eyebrow: 'Clear scope. Labour-based quotations. Careful delivery.',
    primaryKeyword: 'why choose High Quality Clean',
    description: 'The factual standards and working practices behind High Quality Clean.',
    message: 'Clear scope. Labour-based quotations. Careful delivery.',
    audience: 'Buyers comparing providers and evaluating trust.',
    primaryCta: 'Find My Service',
    primaryHref: selector,
    secondaryCta: 'Read Client Success Stories',
    secondaryHref: '/reviews-case-studies/',
    proof: ['Requirements are scoped before delivery', 'Clear inclusions and exclusions are agreed before work', 'No unsupported guarantee or retention claim'],
    related: [{ label: 'How we work', href: '/how-we-work/' }, { label: 'How we price', href: '/cleaning-prices-london/' }, { label: 'About HQC', href: '/about-high-quality-clean/' }]
  },
  {
    slug: 'how-we-work',
    cluster: 'Trust',
    title: 'How Our Cleaning Service Works',
    eyebrow: 'A clear route from requirement to result',
    description: 'See how HQC routes each enquiry to Essential Clean suitability, a tailored quotation or a complex-service assessment.',
    message: 'A clear route from requirement to result.',
    audience: 'Home, workplace, commercial and property clients.',
    primaryCta: 'Start Your Enquiry',
    primaryHref: quote,
    secondaryCta: 'Find My Service',
    secondaryHref: selector,
    proof: ['Essential Clean suitability is reviewed separately', 'Quoted work is reviewed manually', 'Complex requirements receive a separate assessment'],
    related: [{ label: 'How HQC pricing works', href: '/cleaning-prices-london/' }, { label: 'Cleaning FAQs', href: '/cleaning-faqs/' }]
  },
  {
    slug: 'cleaning-prices-london',
    cluster: 'Trust',
    title: 'How HQC Pricing Works',
    eyebrow: 'We price the work required, not bedrooms alone',
    primaryKeyword: 'cleaning prices London',
    description: 'Understand the labour, condition, access and delivery factors used to prepare an HQC cleaning quotation.',
    message: 'We price the work required, not bedrooms alone.',
    audience: 'Residential and commercial prospects seeking price clarity.',
    primaryCta: 'Get a Cleaning Quote',
    primaryHref: quote,
    secondaryCta: 'Check Essential Clean Suitability',
    secondaryHref: selector,
    proof: ['Condition and scope affect labour', 'Access, parking and timing are considered', 'Fixed examples will only be published when validated'],
    related: [{ label: 'Essential Clean', href: '/essential-clean-london/' }, { label: 'Office cleaning', href: '/office-cleaning-london/' }, { label: 'Cleaning FAQs', href: '/cleaning-faqs/' }]
  },
  {
    slug: 'cleaning-faqs',
    cluster: 'Trust',
    title: 'Cleaning FAQs',
    eyebrow: 'Clear answers before you book or request a quotation',
    primaryKeyword: 'cleaning FAQs London',
    description: 'Common questions about booking, quoting, access, products, privacy, cancellations and payments.',
    message: 'Clear answers before you book, request a quotation or arrange an assessment.',
    audience: 'All prospective HQC clients.',
    primaryCta: 'Find My Service',
    primaryHref: selector,
    secondaryCta: 'Contact HQC',
    secondaryHref: '/contact/',
    proof: ['Service-specific requirements remain on their owning page', 'Terms and privacy wording remain authoritative', 'No duplicated FAQ blocks across every service'],
    related: [{ label: 'How we work', href: '/how-we-work/' }, { label: 'How we price', href: '/cleaning-prices-london/' }, { label: 'Terms and conditions', href: '/terms-and-conditions/' }]
  },
  {
    slug: 'reviews-case-studies',
    cluster: 'Trust',
    title: 'Cleaning Reviews and Client Success Stories',
    eyebrow: 'Evidence from homes, workplaces and property clients',
    primaryKeyword: 'High Quality Clean reviews',
    description: 'Permissioned reviews and evidence-led examples, published only where the supporting approval is in place.',
    message: 'See relevant approved evidence when it is available for publication.',
    audience: 'Prospective clients seeking proof and relevant examples.',
    primaryCta: 'Request a Similar Service',
    primaryHref: quote,
    secondaryCta: 'Find My Service',
    secondaryHref: selector,
    proof: ['Only verified reviews are published', 'Images and extended stories require permission', 'Client identities can be anonymised where needed'],
    related: [{ label: 'Property and facilities cleaning', href: '/property-facilities-cleaning-london/' }, { label: 'Office cleaning', href: '/office-cleaning-london/' }, { label: 'Home cleaning', href: '/home-cleaning-london/' }]
  },
  {
    slug: 'request-a-quote',
    cluster: 'Enquiry routing',
    title: 'Request a Cleaning Quote',
    eyebrow: 'Choose the route that matches your requirement',
    description: 'Send the right details for your home, workplace, managed property or complex project.',
    message: 'Choose the route that matches your property, workplace or project.',
    audience: 'Visitors who know their buyer type and need the correct enquiry route.',
    primaryCta: 'Start with the Service Selector',
    primaryHref: selector,
    secondaryCta: 'Contact HQC',
    secondaryHref: '/contact/',
    proof: ['On-screen submission status', 'Route and campaign context are retained', 'Essential Clean suitability is reviewed separately'],
    related: [{ label: 'Home cleaning', href: '/home-cleaning-london/' }, { label: 'Commercial cleaning', href: '/commercial-cleaning-london/' }, { label: 'Property and facilities cleaning', href: '/property-facilities-cleaning-london/' }]
  },
  {
    slug: 'areas-we-cover',
    cluster: 'Locations',
    title: 'Areas We Cover',
    eyebrow: 'London coverage depends on service and team availability',
    primaryKeyword: 'cleaning services London areas',
    description: 'Check HQC availability across Central, West, South West, selected North and selected East London locations.',
    message: 'Professional cleaning services across London, subject to service type and team availability.',
    audience: 'Prospects checking geographic availability.',
    primaryCta: 'Check Availability for Your Postcode',
    primaryHref: quote,
    secondaryCta: 'Find My Service',
    secondaryHref: selector,
    proof: ['Postcode and service checked together', 'No unsupported blanket coverage claim', 'New local pages require unique proof and demand'],
    related: [{ label: 'East London cleaning services', href: '/cleaning-services-east-london/' }, { label: 'Home cleaning', href: '/home-cleaning-london/' }, { label: 'Office cleaning', href: '/office-cleaning-london/' }]
  },
  {
    slug: 'cleaning-services-east-london',
    cluster: 'Locations',
    title: 'Cleaning Services in East London',
    eyebrow: 'One useful East London hub at launch',
    primaryKeyword: 'cleaning services East London',
    description: 'Outcome-led cleaning for homes, workplaces and property projects across selected East London locations.',
    message: 'Outcome-led cleaning for homes, workplaces and property projects across selected East London locations.',
    audience: 'Private clients, property professionals and commercial buyers in East London.',
    primaryCta: 'Check Availability in East London',
    primaryHref: `${quote}?area=east-london`,
    secondaryCta: 'Find My Service',
    secondaryHref: selector,
    proof: ['Shoreditch, Spitalfields and Whitechapel', 'Canary Wharf, Limehouse and Stratford', 'No thin area pages without unique evidence'],
    related: [{ label: 'Areas we cover', href: '/areas-we-cover/' }, { label: 'Property and facilities cleaning', href: '/property-facilities-cleaning-london/' }, { label: 'Office cleaning', href: '/office-cleaning-london/' }]
  }
];

export const outcomePageBySlug = new Map(outcomePages.map((page) => [page.slug, page]));
