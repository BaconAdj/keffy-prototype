import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

export default async function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-navy mb-4">Terms & Conditions</h1>
        <p className="text-sm text-gray-500 mb-8">Effective Date: February 18, 2026 | Last Updated: February 18, 2026</p>
        
        <div className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">Welcome to Keffy</h2>
          <p>These Terms & Conditions ("Terms") govern your use of Keffy, an AI-powered travel planning service ("Service") operated by Keffy ("we," "us," or "our"). By accessing or using Keffy, you agree to be bound by these Terms.</p>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">1. Beta Service Notice</h2>
          <p className="font-semibold">Early Beta Status:</p>
          <p>Keffy is currently in early beta testing. The Service may:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Contain bugs, errors, or incomplete features</li>
            <li>Experience downtime or interruptions</li>
            <li>Change significantly without notice</li>
            <li>Be discontinued at any time</li>
          </ul>
          <p className="font-semibold mt-4">No Warranty:</p>
          <p>The Service is provided "as is" without warranties of any kind. We make no guarantees about the accuracy, reliability, or availability of travel recommendations.</p>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">2. Use of Service</h2>
          <p className="font-semibold">Eligibility:</p>
          <p>You must be at least 18 years old to use Keffy. By using the Service, you represent that you meet this requirement.</p>
          
          <p className="font-semibold mt-4">Account Security:</p>
          <p>You are responsible for maintaining the confidentiality of your account and all activities that occur under your account.</p>
          
          <p className="font-semibold mt-4">Acceptable Use:</p>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use the Service for any illegal purpose</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Upload malicious code or viruses</li>
            <li>Scrape, copy, or misuse our AI models or content</li>
            <li>Impersonate others or provide false information</li>
          </ul>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">3. Travel Bookings & Third-Party Services</h2>
          <p className="font-semibold">Third-Party Bookings:</p>
          <p>Keffy provides links to third-party booking platforms (airlines, hotels, etc.). We:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Do NOT directly process payments</li>
            <li>Are NOT responsible for the quality, accuracy, or fulfillment of third-party services</li>
            <li>Do NOT guarantee prices, availability, or booking confirmations</li>
          </ul>
          
          <p className="font-semibold mt-4">Travel Advice Disclaimer:</p>
          <p>Keffy provides travel recommendations powered by AI. We are NOT a licensed travel agency and do NOT guarantee the safety, suitability, or quality of destinations. We recommend checking official government travel advisories.</p>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">4. AI-Generated Content</h2>
          <p>Keffy uses artificial intelligence to generate travel recommendations. AI may provide inaccurate, outdated, or incomplete information. You should verify all important information independently and use your own judgment when making travel decisions.</p>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">5. Data Collection & Privacy</h2>
          <p className="font-semibold">What We Collect:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Email addresses (for account access)</li>
            <li>Conversation history (to improve recommendations)</li>
            <li>Travel preferences (to personalize suggestions)</li>
            <li>Usage data (to improve the Service)</li>
          </ul>
          <p className="mt-4">See our <a href="/privacy" className="text-gold hover:underline">Privacy Policy</a> for complete details.</p>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">6. Fees & Payments</h2>
          <p className="font-semibold">Commission-Based:</p>
          <p>Keffy earns commissions from third-party booking platforms when you complete bookings through our links. You pay no additional fees.</p>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">7. Disclaimers & Limitations of Liability</h2>
          <p className="font-semibold">AS IS SERVICE:</p>
          <p>KEFFY IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.</p>
          
          <p className="font-semibold mt-4">NO LIABILITY FOR:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Travel disruptions, cancellations, or delays</li>
            <li>Accuracy of AI-generated recommendations</li>
            <li>Third-party booking issues or disputes</li>
            <li>Indirect, incidental, or consequential damages</li>
          </ul>
          
          <p className="font-semibold mt-4">LIMITATION:</p>
          <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY TO YOU SHALL NOT EXCEED $100 USD.</p>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">8. Governing Law</h2>
          <p>These Terms are governed by the laws of Quebec, Canada. Any disputes shall be resolved through good faith negotiation, mediation, or binding arbitration in Montreal, Quebec.</p>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">9. Changes to Terms</h2>
          <p>We may update these Terms at any time. Changes will be posted on this page with an updated "Last Updated" date. Continued use after changes constitutes acceptance of the new Terms.</p>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">10. Contact</h2>
          <p>For questions about these Terms, contact us at:</p>
          <ul className="list-none pl-0 space-y-2">
            <li><strong>Email:</strong> general@keffyai.com</li>
            <li><strong>Website:</strong> keffy.ai</li>
          </ul>
          
          <div className="mt-12 p-6 bg-sand rounded-lg">
            <p className="font-semibold text-navy">Beta Tester Acknowledgment</p>
            <p className="mt-2">By using Keffy during the early beta period, you acknowledge that the Service is experimental and under development. Features may change or be removed without notice. Thank you for being part of Keffy's journey!</p>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">By using Keffy, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
