const linkClass = "text-gold font-medium underline underline-offset-2 hover:text-navy transition-colors";

const tcLink = (anchor, label = 'Terms and Conditions') =>
  `<a href="/terms-and-conditions${anchor ? `#${anchor}` : ''}" class="${linkClass}">${label}</a>`;

export const faqIntro = "Where clarity meets confidence — answers to help you understand how our premium cleaning service works before we speak.";

export const faqData = [
  {
    section: "General",
    items: [
      {
        question: "How do I make a booking?",
        answer: "We don’t offer instant online booking. Our website lets you request a quote or speak with us directly. Once your requirements are confirmed and the terms are agreed, your booking will be scheduled."
      },
      {
        question: "Do I need to be home for my booking?",
        answer: `No, as long as we have safe access and clear instructions. If we’re unable to proceed on arrival, the visit may be limited or treated as an aborted visit. See ${tcLink('access-utilities', 'Section 2 (Access, Utilities & Delays)')} of our Terms and Conditions.`
      },
      {
        question: "When will my card be charged?",
        answer: `Residential services are paid on completion, or in advance where required. Commercial clients are invoiced in line with agreed terms. Full payment terms are set out in ${tcLink('payments', 'Section 3 (Payments & Non-Payment Protection)')} of our Terms and Conditions.`
      },
      {
        question: "How do I cancel or reschedule?",
        answer: `Please contact us directly. We require at least <strong>48 hours’ notice</strong>. Late changes may be charged in line with ${tcLink('cancellations', 'Section 4 (Cancellations & Aborted Visits)')} of our Terms and Conditions.`
      }
    ]
  },
  {
    section: "Cleaning Services",
    items: [
      {
        question: "What supplies do you provide?",
        answer: `For our <strong>Essentials Clean™</strong>, clients provide basic supplies. For deep or detailed cleans, we bring everything needed. Commercial supplies are provided as agreed in the service scope. See ${tcLink('pricing-scope', 'Section 1 (Pricing, Scope & Variations)')} of our Terms and Conditions.`
      },
      {
        question: "Are appliances, inside cupboards, or interior windows included?",
        answer: "No, unless specifically agreed in advance."
      },
      {
        question: "What is a deep clean?",
        answer: `A deep clean (e.g. <strong>Signature Clean™</strong> and <strong>WellClean™</strong>) is a more detailed, intensive service, ideal for first-time customers or properties that haven’t been professionally cleaned for some time. Service standards and limitations are described in ${tcLink('service-standards', 'Section 6 (Service Standards & Limitations)')} of our Terms and Conditions.`
      },
      {
        question: "Do you offer carpet cleaning and end of tenancy cleaning?",
        answer: `Yes. We offer both as separate services. Scope and availability are confirmed when you speak with us. All services are provided under our ${tcLink('')}.`
      },
      {
        question: "What’s included in a standard clean?",
        answer: `A standard clean — our <strong>Essentials Clean™</strong> — covers routine cleaning tasks. The exact scope is confirmed when your service is agreed, in line with ${tcLink('pricing-scope', 'Section 1 (Pricing, Scope & Variations)')} of our Terms and Conditions.`
      }
    ]
  },
  {
    section: "Pricing & Payments",
    items: [
      {
        question: "Do you offer discounts for regular customers?",
        answer: `Yes. Regular or recurring services may qualify for preferential pricing, which is confirmed when your service is agreed. Recurring and contracted services are governed by ${tcLink('contracted-services', 'Section 10 (Contracted & Recurring Services)')} of our Terms and Conditions.`
      },
      {
        question: "Are your prices fixed?",
        answer: `Prices are based on the information provided. If the scope or condition differs, pricing may be adjusted by agreement, as set out in ${tcLink('pricing-scope', 'Section 1 (Pricing, Scope & Variations)')} of our Terms and Conditions.`
      }
    ]
  },
  {
    section: "Quality & Trust",
    items: [
      {
        question: "What is the guarantee?",
        answer: `We guarantee a professional standard of service. Any issues must be reported within <strong>72 hours</strong> so we can review them in line with ${tcLink('complaints', 'Section 7 (Complaints & Remedies)')} of our Terms and Conditions.`
      },
      {
        question: "Do you have insurance?",
        answer: `Yes. We hold appropriate public and employer’s liability insurance. Full details are set out in ${tcLink('liability-insurance', 'Section 8 (Liability & Insurance)')} of our Terms and Conditions.`
      }
    ]
  },
  {
    section: "Access & Outcomes",
    items: [
      {
        question: "What happens if I can’t provide access on the day?",
        answer: `If we’re unable to access the property or proceed as agreed, the visit may be limited or treated as an aborted visit. See ${tcLink('access-utilities', 'Section 2 (Access, Utilities & Delays)')} of our Terms and Conditions.`
      },
      {
        question: "Will a professional clean remove all stains or marks?",
        answer: `Professional cleaning improves appearance but can’t guarantee the removal of permanent stains or damage. See ${tcLink('service-standards', 'Section 6 (Service Standards & Limitations)')} of our Terms and Conditions.`
      }
    ]
  }
];
