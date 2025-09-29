import 'https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.1.0/dist/cookieconsent.umd.js';

CookieConsent.run({
    guiOptions: {
        consentModal: {
            layout: "box",
            position: "bottom left",
            equalWeightButtons: true,
            flipButtons: false
        },
        preferencesModal: {
            layout: "box",
            position: "right",
            equalWeightButtons: true,
            flipButtons: false
        }
    },
    categories: {
        necessary: {
            readOnly: true
        },
        analytics: {}
    },
    language: {
        default: "en",
        autoDetect: "browser",
        translations: {
            en: {
                consentModal: {
                    title: "We Value Your Privacy",
                    description: "High Quality Clean respects your privacy and handles your data with the same care and discretion we bring to your space. We use cookies to enhance your experience and understand how we can better serve you. You can choose which cookies you're comfortable with.",
                    acceptAllBtn: "Accept all",
                    acceptNecessaryBtn: "Essential only",
                    showPreferencesBtn: "Manage preferences",
                    footer: "<a href=\"#link\">Privacy Policy</a>\n<a href=\"#link\">Terms and Conditions</a>"
                },
                preferencesModal: {
                    title: "Your Privacy Preferences",
                    acceptAllBtn: "Accept all",
                    acceptNecessaryBtn: "Essential only",
                    savePreferencesBtn: "Save preferences",
                    closeIconLabel: "Close modal",
                    serviceCounterLabel: "Service|Services",
                    sections: [
                        {
                            title: "How We Use Cookies",
                            description: "We use cookies to provide you with a seamless experience when requesting our services. These small files help us remember your preferences, understand how you use our website, and continuously improve the quality of service we deliver."
                        },
                        {
                            title: "Essential Cookies <span class=\"pm__badge\">Always Enabled</span>",
                            description: "These cookies are necessary for our website to function properly. They enable core features like secure booking, form submissions, and quote requests. Without these, we cannot provide our services effectively.",
                            linkedCategory: "necessary"
                        },
                        {
                            title: "Analytics Cookies",
                            description: "These cookies help us understand how visitors interact with our website, allowing us to refine the experience and ensure we're meeting the high standards our clients expect. All data is collected anonymously and handled with complete discretion.",
                            linkedCategory: "analytics"
                        },
                        {
                            title: "Questions About Privacy?",
                            description: "We're committed to transparency and protecting your information. For any questions about how we handle your data, please <a class=\"cc__link\" href=\"#contact\">contact us directly</a>. Your trust matters to us."
                        }
                    ]
                }
            }
        }
    }
});