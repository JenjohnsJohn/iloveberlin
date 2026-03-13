import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'ILoveBerlin privacy policy - how we collect, use, and protect your personal data.',
};

export default function PrivacyPolicyPage() {
  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: March 12, 2026</p>

      <div className="prose prose-gray max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
          <p className="text-gray-600 leading-relaxed">
            Welcome to ILoveBerlin (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting
            your personal data and respecting your privacy. This Privacy Policy explains how we collect,
            use, disclose, and safeguard your information when you visit our website at iloveberlin.biz.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Data We Collect</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            We may collect the following types of personal data:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-1">
            <li>Account information: name, email address, profile details</li>
            <li>Usage data: pages visited, search queries, interaction patterns</li>
            <li>Technical data: IP address, browser type, device information</li>
            <li>Cookie data: preferences, session identifiers</li>
            <li>Communication data: messages, feedback, and support requests</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Data</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            We use the data we collect to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-1">
            <li>Provide and maintain our services</li>
            <li>Personalize your experience and content recommendations</li>
            <li>Analyze usage patterns to improve our platform</li>
            <li>Send important notifications and updates</li>
            <li>Prevent fraud and ensure platform security</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Cookies</h2>
          <p className="text-gray-600 leading-relaxed">
            We use cookies and similar tracking technologies to enhance your browsing experience.
            Essential cookies are required for the website to function properly. Analytics cookies
            help us understand how visitors interact with our platform. You can control your cookie
            preferences through the cookie consent banner or your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Your Rights Under GDPR</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            Under the General Data Protection Regulation (GDPR), you have the following rights:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-1">
            <li><strong>Right of access:</strong> You can request a copy of your personal data.</li>
            <li><strong>Right to rectification:</strong> You can request correction of inaccurate data.</li>
            <li><strong>Right to erasure:</strong> You can request deletion of your personal data.</li>
            <li><strong>Right to restrict processing:</strong> You can limit how we use your data.</li>
            <li><strong>Right to data portability:</strong> You can request your data in a machine-readable format.</li>
            <li><strong>Right to object:</strong> You can object to processing based on legitimate interests.</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-3">
            To exercise any of these rights, please contact us at privacy@iloveberlin.biz.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Retention</h2>
          <p className="text-gray-600 leading-relaxed">
            We retain your personal data only for as long as necessary to fulfill the purposes outlined
            in this policy or as required by law. When data is no longer needed, it is securely deleted
            or anonymized.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Data Security</h2>
          <p className="text-gray-600 leading-relaxed">
            We implement appropriate technical and organizational measures to protect your personal data
            against unauthorized access, alteration, disclosure, or destruction. However, no method of
            transmission over the Internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Contact Us</h2>
          <p className="text-gray-600 leading-relaxed">
            If you have any questions about this Privacy Policy or our data practices, please contact
            our Data Protection Officer at privacy@iloveberlin.biz.
          </p>
        </section>
      </div>
    </main>
  );
}
