import ReactMarkdown from "react-markdown";

export default function PrivacyPage() {
  const content = `
# Privacy Policy — Lingput

**Effective date:** September 4, 2025
**Service:** Lingput (AI-powered language learning platform)

---

## 1. Introduction

Lingput is an AI-powered language learning application. This Privacy Policy explains how we collect, use, and protect your personal data when you use Lingput.

---

## 2. What Data We Collect

* **Account information**: email address, username, password (hashed).
* **Learning progress**: words, stories, and exercises you complete, your vocabulary history, and session stats.
* **Generated content**: stories, translations, and audio files generated for you by our AI.
* **Technical data**: browser type, IP address, device information, cookies (only with your consent).
* **Payment data**: if applicable, processed securely by third-party payment providers (we do not store your card details).

---

## 3. How We Use Your Data

* To provide the Lingput service (saving your learning history, generating personalized exercises).
* To improve the platform (analytics, performance monitoring, bug fixing).
* To ensure security (account authentication, fraud prevention).
* To comply with legal obligations (tax, accounting, regulatory compliance).

We do **not** sell your personal information.

---

## 4. AI-Generated Content

Lingput uses third-party AI services (e.g., OpenAI APIs) to generate stories, translations, and audio.

* Your input text may be transmitted to these services to generate the output.
* Data is not used by these providers to train their models (per their policies at the time of writing).
* We only store the outputs relevant to your learning history.

---

## 5. Cookies and Tracking

Lingput uses cookies only with your consent:

* **Functional cookies**: required for login and session security.
* **Analytics cookies**: optional, used to understand usage patterns (Google Analytics 4 with Consent Mode).
* **No advertising cookies** are used.

You can change your cookie preferences anytime via the “Cookie Settings” link.

---

## 6. Data Sharing

We share data only with trusted providers necessary to operate Lingput:

* **Hosting & infrastructure**: DigitalOcean, AWS, Supabase, Redis.
* **Analytics**: Google Analytics (if you consent).
* **AI processing**: OpenAI API for text and audio generation.
* **Payments**: Stripe or other payment processors (if you purchase a subscription).

---

## 7. Data Retention

* Account data is stored until you delete your account.
* Learning history persists while your account is active.
* Analytics data (if enabled) is retained per provider defaults (up to 14 months).
* Server logs are rotated every 30–90 days.

---

## 8. Your Rights

Depending on your jurisdiction (EU/EEA, UK, California), you may have the right to:

* Access, correct, or delete your personal data.
* Request export of your data (data portability).
* Withdraw consent for analytics cookies.
* Delete your account at any time.

To exercise these rights, contact us at **support@lingput.dev**.

---

## 9. Security

We use HTTPS, hashed passwords, access controls, and monitoring to protect your data.
However, no online service is 100% secure — please use a strong password and keep it private.

---

## 10. Children’s Privacy

Lingput is not directed to children under 13 (or the age of digital consent in your region).
We do not knowingly collect personal information from children.

---

## 11. Changes

We may update this Privacy Policy occasionally. Updates will be posted here with a new “Effective date.”

---

## 12. Contact

For questions, requests, or concerns:
Email: **[support@lingput.dev](mailto:support@lingput.dev)**
`;

  return (
    <div>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
