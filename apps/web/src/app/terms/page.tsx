import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Betless Terms of Service — Rules for using the Betless prediction platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-brand-black">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-brand-green hover:underline text-sm">
          ← Back to Betless
        </Link>

        <div className="glass-card p-8 md:p-12 space-y-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">Terms & Conditions</h1>
            <p className="text-gray-400 text-sm">Effective Date: June 1, 2024</p>
          </div>

          <div className="p-4 rounded-xl bg-brand-green/10 border border-brand-green/20">
            <p className="text-brand-green font-semibold text-sm">
              🎯 Betless is a FREE sports prediction platform. There is NO real-money gambling, betting, wagering, or casino activity of any kind.
            </p>
          </div>

          <div className="space-y-6 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
              <p>By accessing or using Betless, you agree to be bound by these Terms. If you do not agree, do not use the platform.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. Platform Description</h2>
              <p>Betless is a free-to-use football prediction and ranking platform focused on the Saudi Pro League. Users:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Predict match outcomes (Home Win, Draw, Away Win)</li>
                <li>Earn virtual points for correct predictions</li>
                <li>Compete on leaderboards</li>
                <li>Unlock achievements and badges</li>
              </ul>
              <p className="mt-3 font-semibold text-white">No money is wagered, transferred, or won. All points are virtual with no monetary value.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. Eligibility</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>You must be at least 13 years old to use Betless</li>
                <li>One account per person is allowed</li>
                <li>Accounts must not be created using automated means</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">4. Account Responsibilities</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Provide accurate registration information</li>
                <li>Notify us immediately of unauthorized account use</li>
                <li>You are responsible for all activity under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">5. Prohibited Conduct</h2>
              <p>You must not:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Use bots, scripts, or automated tools to submit predictions</li>
                <li>Create multiple accounts to gain unfair advantage</li>
                <li>Harass, abuse, or threaten other users</li>
                <li>Post offensive, discriminatory, or inappropriate content</li>
                <li>Attempt to manipulate leaderboard rankings</li>
                <li>Reverse-engineer or attempt to access our systems</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">6. Virtual Points & Rankings</h2>
              <p>Points earned on Betless are virtual, non-transferable, and have no monetary value. Rankings and achievements are for entertainment and competition purposes only. We reserve the right to adjust points, rankings, or achievements at our discretion.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">7. Content</h2>
              <p>By posting comments or other content, you grant Betless a non-exclusive, royalty-free license to use, display, and distribute such content on the platform. You must not post content that is illegal, harmful, or violates third-party rights.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">8. Termination</h2>
              <p>We may suspend or terminate accounts that violate these Terms, engage in abusive behavior, or at our sole discretion. You may delete your account at any time through Settings.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">9. Disclaimer</h2>
              <p>Betless is provided "as is" without warranties of any kind. We do not guarantee the accuracy of match data, predictions, or results. The platform is for entertainment purposes only.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">10. Limitation of Liability</h2>
              <p>To the maximum extent permitted by law, Betless shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">11. Changes to Terms</h2>
              <p>We reserve the right to modify these Terms at any time. Continued use of the platform after changes constitutes acceptance of the new Terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">12. Contact</h2>
              <div className="p-4 rounded-xl bg-brand-dark border border-brand-border">
                <p>Email: legal@betless.app</p>
                <p>Support: support@betless.app</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
