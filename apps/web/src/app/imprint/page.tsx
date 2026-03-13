import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Imprint (Impressum)',
  description: 'ILoveBerlin legal imprint - Impressum as required by German law.',
};

export default function ImprintPage() {
  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Impressum (Imprint)</h1>

      <div className="prose prose-gray max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Angaben gem. &sect; 5 TMG (Information according to &sect; 5 TMG)
          </h2>
          <div className="text-gray-600 leading-relaxed space-y-1">
            <p>ILoveBerlin GmbH</p>
            <p>Musterstra&szlig;e 123</p>
            <p>10115 Berlin</p>
            <p>Germany</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Kontakt (Contact)</h2>
          <div className="text-gray-600 leading-relaxed space-y-1">
            <p>Telefon: +49 (0) 30 123456-0</p>
            <p>E-Mail: info@iloveberlin.biz</p>
            <p>Website: www.iloveberlin.biz</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Vertreten durch (Represented by)
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Gesch&auml;ftsf&uuml;hrer (Managing Director): Max Mustermann
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Registereintrag (Register Entry)
          </h2>
          <div className="text-gray-600 leading-relaxed space-y-1">
            <p>Eingetragen im Handelsregister (Registered at): Amtsgericht Charlottenburg</p>
            <p>Registernummer (Registration number): HRB 123456 B</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Umsatzsteuer-ID (VAT ID)
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Umsatzsteuer-Identifikationsnummer gem&auml;&szlig; &sect; 27a UStG: DE 123456789
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Verantwortlich f&uuml;r den Inhalt gem. &sect; 55 Abs. 2 RSt (Responsible for Content)
          </h2>
          <div className="text-gray-600 leading-relaxed space-y-1">
            <p>Max Mustermann</p>
            <p>ILoveBerlin GmbH</p>
            <p>Musterstra&szlig;e 123</p>
            <p>10115 Berlin</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Datenschutzbeauftragter (Data Protection Officer)
          </h2>
          <div className="text-gray-600 leading-relaxed space-y-1">
            <p>E-Mail: privacy@iloveberlin.biz</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Streitschlichtung (Dispute Resolution)
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Die Europ&auml;ische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 underline hover:text-primary-700"
            >
              https://ec.europa.eu/consumers/odr
            </a>
          </p>
          <p className="text-gray-600 leading-relaxed mt-2">
            The European Commission provides an Online Dispute Resolution (ODR) platform at the link above.
            We are not willing or obliged to participate in dispute resolution proceedings before a consumer
            arbitration board.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Haftungsausschluss (Disclaimer)
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Despite careful content control, we assume no liability for the content of external links.
            The operators of the linked pages are solely responsible for their content. The contents
            of our pages were created with the greatest care. However, we cannot guarantee that the
            content is up-to-date, complete, or accurate.
          </p>
        </section>
      </div>
    </main>
  );
}
