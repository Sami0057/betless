import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Betless Privacy Policy — How we collect, use, and protect your personal data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-brand-black">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-brand-green hover:underline text-sm">
          ← Back to Betless
        </Link>

        <div className="glass-card p-8 md:p-12 space-y-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">Privacy Policy</h1>
            <p className="text-gray-400 text-sm">Effective Date: June 1, 2024 | Last Updated: June 1, 2024</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. Introduction</h2>
              <p>Betless ("we", "our", "us") operates the Betless football prediction platform ("Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.</p>
              <p className="mt-2"><strong className="text-white">Important:</strong> Betless is a free sports prediction platform. We do not facilitate gambling, betting, or any real-money wagering. All predictions are made for entertainment and competition purposes only.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. Information We Collect</h2>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">2.1 Information You Provide</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Account registration data (username, email address, password)</li>
                <li>Profile information (avatar, favorite team, language preference)</li>
                <li>Prediction data (your match outcome predictions)</li>
                <li>Communications (comments, support requests)</li>
              </ul>
              <h3 className="text-lg font-semibold text-gray-200 mb-2 mt-4">2.2 Automatically Collected Information</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Device information (device type, operating system, browser)</li>
                <li>Usage data (pages visited, features used, time spent)</li>
                <li>IP address and approximate location (country/city level)</li>
                <li>App performance data and crash reports</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide, operate, and improve the Betless platform</li>
                <li>Process predictions and update leaderboards</li>
                <li>Send notifications about match results and achievements</li>
                <li>Personalize your experience and content</li>
                <li>Ensure platform security and prevent fraud</li>
                <li>Comply with legal obligations</li>
                <li>Communicate updates and announcements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">4. Data Sharing</h2>
              <p>We do not sell your personal data. We may share information with:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong className="text-white">Service providers:</strong> Cloud hosting, email delivery, analytics</li>
                <li><strong className="text-white">Legal authorities:</strong> When required by applicable law</li>
                <li><strong className="text-white">Business transfers:</strong> In connection with mergers or acquisitions</li>
              </ul>
              <p className="mt-2">Your username, rank, and prediction statistics are publicly visible on leaderboards.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">5. Data Security</h2>
              <p>We implement industry-standard security measures including encryption, secure servers, and access controls. However, no method of internet transmission is 100% secure. We encourage you to use a strong, unique password.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">6. Your Rights</h2>
              <p>Depending on your location, you may have the right to:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Access and receive a copy of your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your account and data</li>
                <li>Opt out of marketing communications</li>
                <li>Data portability</li>
              </ul>
              <p className="mt-2">To exercise these rights, contact us at privacy@betless.app</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">7. Children's Privacy</h2>
              <p>Betless is intended for users aged 13 and older. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has provided personal information, please contact us immediately.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">8. Cookies & Tracking</h2>
              <p>We use essential cookies for authentication and session management. We may use analytics cookies to understand how the platform is used. You can control cookie settings through your browser.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">9. International Data Transfers</h2>
              <p>Your data may be processed in countries outside your residence, including the United States and the European Union. We ensure appropriate safeguards are in place for such transfers.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">10. Changes to This Policy</h2>
              <p>We may update this Privacy Policy periodically. We will notify you of material changes via email or prominent notice on the platform. Continued use after changes constitutes acceptance.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">11. Contact Us</h2>
              <p>For privacy-related questions or to exercise your rights:</p>
              <div className="mt-2 p-4 rounded-xl bg-brand-dark border border-brand-border">
                <p className="text-white font-medium">Betless Privacy Team</p>
                <p>Email: privacy@betless.app</p>
                <p>Support: support@betless.app</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
