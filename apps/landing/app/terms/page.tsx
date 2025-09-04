import ReactMarkdown from "react-markdown";

export default function TermsPage() {
  const content = `
# Terms of Service — Lingput

**Effective date:** September 4, 2025
**Service:** Lingput (AI-powered language learning platform)

---

## 1. Acceptance of Terms

By creating an account or using Lingput, you agree to be bound by these Terms of Service and our [Privacy Policy](/privacy).
If you do not agree, you may not use the Service.

---

## 2. Eligibility

You must be at least 13 years old (or the age of digital consent in your country) to use Lingput.
By using Lingput, you represent that you meet this requirement.

---

## 3. Accounts

* You are responsible for maintaining the security of your account and password.
* You must provide accurate information when creating an account.
* You are responsible for all activity that occurs under your account.
* You may delete your account at any time.

---

## 4. Acceptable Use

You agree **not to**:

* Use Lingput for unlawful, harmful, or abusive purposes.
* Attempt to disrupt, hack, or overload the Service.
* Upload or generate offensive, discriminatory, or illegal content.

We reserve the right to suspend or terminate accounts that violate these rules.

---

## 5. Content & Intellectual Property

* **Your content**: You own the learning inputs you provide (e.g., words, sentences).
* **AI-generated outputs**: You may use the generated stories, translations, and audio for personal learning. Commercial use requires prior written permission.
* **Our content**: The Lingput name, code, and design are owned by us and protected by copyright and trademark laws.

---

## 6. Payments (if applicable)

* Some features may require a paid subscription.
* Payments are processed securely by third-party providers (e.g., Stripe).
* Refunds are governed by our Refund Policy (published separately if applicable).
* We may change pricing with reasonable notice.

---

## 7. Service Availability

Lingput is provided “as is” and “as available.”
We do not guarantee uninterrupted or error-free service.
We may modify, suspend, or discontinue features at any time.

---

## 8. Limitation of Liability

To the maximum extent permitted by law:

* We are not liable for indirect, incidental, or consequential damages.
* Our total liability for any claim related to Lingput will not exceed the amount you paid us in the last 12 months (if any).

---

## 9. Indemnification

You agree to indemnify and hold us harmless from claims, damages, or expenses arising from your misuse of Lingput or violation of these Terms.

---

## 10. Changes to Terms

We may update these Terms from time to time. Updates will be posted on this page with a new effective date. Continued use after updates means you accept the changes.

---

## 11. Governing Law

These Terms are governed by the laws of the United States and the State of California.
Any disputes will be handled in courts located in California.

---

## 12. Contact

For questions about these Terms:
Email: **support@lingput.dev**

`;

  return (
    <div>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
