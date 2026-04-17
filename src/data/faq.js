const linkClass = "text-gold font-medium underline underline-offset-2 hover:text-navy transition-colors";

const tcLink = (anchor, label = 'Terms and Conditions') =>
    `<a href="/terms-and-conditions${anchor ? `#${anchor}` : ''}" class="${linkClass}">${label}</a>`;

export const faqData = [
    {
      section: "General",
      items: [
        {
          question: "How do I make a booking?",
          answer: `Fill out our enquiry form online, or call 0208 8703925. We'll contact you to confirm details and availability. All bookings are subject to our ${tcLink('')}.`
        },
        {
          question: "Do I need to be home for my booking?",
          answer: `No, you don't need to be home. Just arrange access with your cleaner. See ${tcLink('access-utilities', 'Section 2 (Access, Utilities & Delays)')} of our Terms and Conditions.`
        },
        {
          question: "When will my card be charged?",
          answer: `Your card is charged the day after your cleaning is completed. Full payment terms are set out in ${tcLink('payments', 'Section 3 (Payments & Non-Payment Protection)')} of our Terms and Conditions.`
        },
        {
          question: "How do I cancel or reschedule?",
          answer: `A minimum of 48 hours' notice is required to cancel or reschedule. Within 48 hours, a fee equal to the greater of £95 or 50% of the service price applies, as set out in ${tcLink('cancellations', 'Section 4 (Cancellations & Aborted Visits)')} of our Terms and Conditions.`
        }
      ]
    },
    {
      section: "Cleaning",
      items: [
        {
          question: "What supplies do you provide?",
          answer: `For Essential residential cleans, clients provide basic supplies. For deep or detailed cleans, we bring everything needed. Commercial supplies are provided as agreed in the service scope. See ${tcLink('pricing-scope', 'Section 1 (Pricing, Scope & Variations)')} of our Terms and Conditions.`
        },
        {
          question: "What's included in a standard clean?",
          answer: `A standard clean / our Essential Clean covers routine cleaning tasks. The exact scope is confirmed when your service is agreed, in line with ${tcLink('pricing-scope', 'Section 1 (Pricing, Scope & Variations)')} of our Terms and Conditions.`
        },
        {
          question: "What is a deep clean?",
          answer: `A comprehensive service for properties that haven't had professional cleaning in 3+ months, or for first-time bookings to establish our high standard. Service standards and limitations are described in ${tcLink('service-standards', 'Section 6 (Service Standards & Limitations)')} of our Terms and Conditions.`
        },
        {
          question: "Do you offer carpet cleaning and end of tenancy cleans?",
          answer: `Yes, we provide specialized carpet cleaning and professional end-of-tenancy services. Please contact us for a detailed quote. All services are provided under our ${tcLink('')}.`
        }
      ]
    },
    {
      section: "Pricing & Discounts",
      items: [
        {
          question: "Do you offer discounts for regular customers?",
          answer: `Yes, we offer preferential rates for recurring residential and commercial contracts. Contact our team for a tailored proposal. Recurring and contracted services are governed by ${tcLink('contracted-services', 'Section 10 (Contracted & Recurring Services)')} of our Terms and Conditions.`
        },
        {
          question: "What is the guarantee?",
          answer: `We aim for perfection. If any area is missed, please report it within 72 hours with evidence, and we will re-attend or offer a service credit at our discretion. See ${tcLink('complaints', 'Section 7 (Complaints & Remedies)')} of our Terms and Conditions.`
        },
        {
          question: "Do you have insurance?",
          answer: `Yes, HQC holds comprehensive public and employer's liability insurance for your peace of mind. Full details are set out in ${tcLink('liability-insurance', 'Section 8 (Liability & Insurance)')} of our Terms and Conditions.`
        }
      ]
    }
  ];
