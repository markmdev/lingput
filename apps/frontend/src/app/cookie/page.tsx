import ReactMarkdown from "react-markdown";

export default function TermsPage() {
  const content = `
# Cookie Policy — Lingput

**Effective date:** September 4, 2025
**Service:** Lingput (AI-powered language learning platform)

---

## 1. What Are Cookies?

Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and improve your browsing experience. Some cookies are essential, while others are optional.

---

## 2. How Lingput Uses Cookies

We use cookies in the following categories:

* **Essential cookies (required)**
  Needed for core functionality such as login sessions, account security, and remembering your language progress.
  These cannot be disabled.

* **Analytics cookies (optional)**
  With your consent, we use Google Analytics 4 (Consent Mode) to understand how users interact with Lingput and to improve the platform. These cookies are only activated if you click **Accept** in the cookie banner.

* **No advertising cookies**
  Lingput does not use advertising, remarketing, or personalization cookies.

---

## 3. Managing Your Cookie Preferences

* When you first visit Lingput, you can accept or reject analytics cookies via the cookie banner.
* You can change your choice at any time by clicking **Cookie Settings** in the footer.
* You can also delete cookies through your browser settings.

---

## 4. Third-Party Cookies

Some cookies may be placed by trusted third parties:

* **Google Analytics (Google LLC, USA)** — analytics cookies (only with your consent).

---

## 5. More Information

For details on how we handle personal data, see our [Privacy Policy](/privacy).

If you have questions about this Cookie Policy, contact us at **support@lingput.dev**.

  `;

  return (
    <div>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
