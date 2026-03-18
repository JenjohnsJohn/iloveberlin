import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'ILOVEBERLIN terms of service - rules and guidelines for using our platform.',
};

export default function TermsOfServicePage() {
  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: March 12, 2026</p>

      <div className="prose prose-gray max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
          <p className="text-gray-600 leading-relaxed">
            By accessing or using the ILOVEBERLIN platform (&quot;Service&quot;), you agree to be bound by
            these Terms of Service. If you do not agree to these terms, please do not use our Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
          <p className="text-gray-600 leading-relaxed">
            ILOVEBERLIN is a digital lifestyle platform providing news, events, dining guides, videos,
            classifieds, and other content related to life in Berlin. We reserve the right to modify,
            suspend, or discontinue any aspect of the Service at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            When you create an account, you agree to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-1">
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Notify us immediately of any unauthorized access</li>
            <li>Accept responsibility for all activities under your account</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. User Content</h2>
          <p className="text-gray-600 leading-relaxed">
            You retain ownership of content you submit to ILOVEBERLIN. By posting content, you grant
            us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your
            content on our platform. You are responsible for ensuring your content does not violate
            any laws or third-party rights.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Prohibited Conduct</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            You may not:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-1">
            <li>Use the Service for any illegal purpose</li>
            <li>Post harmful, threatening, or discriminatory content</li>
            <li>Attempt to access other users&apos; accounts</li>
            <li>Interfere with the proper functioning of the Service</li>
            <li>Scrape or collect data without authorization</li>
            <li>Impersonate any person or entity</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Intellectual Property</h2>
          <p className="text-gray-600 leading-relaxed">
            The ILOVEBERLIN platform, including its design, logos, text, graphics, and software, is
            owned by ILOVEBERLIN and is protected by copyright and trademark laws. You may not
            reproduce, distribute, or create derivative works without our express written permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Disclaimer of Warranties</h2>
          <p className="text-gray-600 leading-relaxed">
            The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
            either express or implied. We do not guarantee that the Service will be uninterrupted,
            secure, or error-free.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Limitation of Liability</h2>
          <p className="text-gray-600 leading-relaxed">
            To the fullest extent permitted by law, ILOVEBERLIN shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages arising from your use of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Governing Law</h2>
          <p className="text-gray-600 leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws of the Federal
            Republic of Germany. Any disputes shall be subject to the exclusive jurisdiction of the
            courts in Berlin, Germany.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact</h2>
          <p className="text-gray-600 leading-relaxed">
            For questions about these Terms of Service, please contact us at legal@iloveberlin.biz.
          </p>
        </section>
      </div>
    </main>
  );
}
