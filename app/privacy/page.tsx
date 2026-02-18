import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

export default async function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-navy mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Effective Date: February 18, 2026 | Last Updated: February 18, 2026</p>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-lg mb-6">We respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, share, and protect your data when you use Keffy.</p>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">1. Information We Collect</h2>
          
          <p className="font-semibold">A. Information You Provide:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account Information:</strong> Email address (required), name, profile picture (optional)</li>
            <li><strong>Travel Preferences:</strong> Home airport/city, dietary restrictions, travel style, budget preferences, preferred airlines</li>
            <li><strong>Conversation Data:</strong> All messages you send to Keffy, AI-generated responses, travel inquiries and itineraries</li>
            <li><strong>Feedback:</strong> Feedback you provide, emails, survey responses</li>
          </ul>
          
          <p className="font-semibold mt-4">B. Information We Collect Automatically:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Usage Data:</strong> Pages viewed, features used, time spent, clicks and interactions</li>
            <li><strong>Technical Data:</strong> Device type, browser, IP address, general location (city/country)</li>
            <li><strong>Cookies:</strong> Essential, analytics, and performance cookies</li>
          </ul>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Provide the Service:</strong> Create and manage your account, generate personalized recommendations, store conversation history</li>
            <li><strong>Improve the Service:</strong> Train and improve our AI models, analyze usage patterns, fix bugs, develop new features</li>
            <li><strong>Communicate with You:</strong> Send product updates (with your consent), respond to inquiries, request feedback</li>
            <li><strong>Business Operations:</strong> Process affiliate commissions, comply with legal obligations, prevent fraud</li>
          </ul>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">3. How We Share Your Information</h2>
          <p className="font-semibold">We do NOT sell your personal information.</p>
          
          <p className="mt-4">We may share data with:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Service Providers:</strong> Cloud hosting (Vercel, Supabase), authentication (Clerk), AI processing (Anthropic), email services (Resend)</li>
            <li><strong>Booking Partners:</strong> When you click booking links, you're redirected to third-party sites with their own privacy policies</li>
            <li><strong>Legal Requirements:</strong> If required by law, to comply with legal requests, or to protect our rights</li>
            <li><strong>Anonymized Data:</strong> We may share aggregated, anonymized statistics that cannot identify you</li>
          </ul>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">4. Data Retention</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Active Accounts:</strong> We retain your data as long as your account is active</li>
            <li><strong>Deleted Accounts:</strong> Most data is deleted within 30 days of account deletion</li>
            <li><strong>Deleted Conversations:</strong> Hidden from your view but retained for 90 days for quality assurance, then permanently deleted</li>
            <li><strong>Legal Holds:</strong> Data subject to legal holds may be retained longer</li>
          </ul>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">5. Your Privacy Rights</h2>
          <p>You have the following rights:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Correction:</strong> Update incorrect or incomplete data</li>
            <li><strong>Deletion:</strong> Request deletion of your data</li>
            <li><strong>Portability:</strong> Receive your data in a portable format</li>
            <li><strong>Withdraw Consent:</strong> Opt out of marketing emails</li>
          </ul>
          
          <p className="mt-4 font-semibold">How to Exercise Rights:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Email: general@keffyai.com</li>
            <li>Account Settings: Delete conversations or account</li>
            <li>Unsubscribe: Click link in marketing emails</li>
          </ul>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">6. Marketing Communications</h2>
          <p className="font-semibold">Product Updates (Optional):</p>
          <p>When you create an account, you can choose to receive product announcements, new features, and travel inspiration.</p>
          
          <p className="mt-4 font-semibold">How to Opt Out:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Unsubscribe link in every marketing email</li>
            <li>Account settings</li>
            <li>Email general@keffyai.com</li>
          </ul>
          
          <p className="mt-4 font-semibold">Service Emails (Always Sent):</p>
          <p>Even if you opt out of marketing, we'll still send account security notifications, service updates, and responses to your inquiries.</p>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">7. Data Security</h2>
          <p>We implement industry-standard security measures:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Technical:</strong> Encryption in transit (HTTPS/TLS), encryption at rest, secure cloud infrastructure</li>
            <li><strong>Organizational:</strong> Limited employee access, confidentiality agreements, security training</li>
          </ul>
          
          <p className="mt-4">However, no system is 100% secure. You are responsible for keeping your password confidential.</p>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">8. International Data Transfers</h2>
          <p>Your data may be stored and processed in Canada, United States, or European Union. We ensure adequate protections through standard contractual clauses and data processing agreements.</p>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">9. Children's Privacy</h2>
          <p>Keffy is NOT intended for users under 18. We do not knowingly collect data from children. If we discover we've collected a child's data, we will delete it immediately.</p>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">10. Cookies & Tracking</h2>
          <p>We use:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Essential Cookies:</strong> Required for the Service to function</li>
            <li><strong>Analytics Cookies:</strong> Help us understand usage</li>
            <li><strong>Performance Cookies:</strong> Monitor Service performance</li>
          </ul>
          <p className="mt-4">You can control cookies through your browser settings, but blocking some may affect functionality.</p>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">11. Regional Privacy Rights</h2>
          
          <p className="font-semibold">California (CCPA):</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Right to know what data we collect</li>
            <li>Right to delete your data</li>
            <li>Right to opt-out (we don't sell data)</li>
            <li>Right to non-discrimination</li>
          </ul>
          
          <p className="font-semibold mt-4">European Union (GDPR):</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Right to access, correction, deletion</li>
            <li>Right to data portability</li>
            <li>Right to object to processing</li>
            <li>Right to lodge complaints with supervisory authority</li>
          </ul>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">12. Changes to This Policy</h2>
          <p>We may update this Privacy Policy to reflect new features, legal changes, or user feedback. We will notify you of material changes via email or in-app notice.</p>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">13. Contact Us</h2>
          <p>For privacy questions or requests:</p>
          <ul className="list-none pl-0 space-y-2">
            <li><strong>Email:</strong> general@keffyai.com</li>
            <li><strong>Subject:</strong> "Privacy Inquiry"</li>
            <li><strong>Website:</strong> keffy.ai</li>
          </ul>
          
          <div className="mt-12 p-6 bg-sand rounded-lg">
            <p className="font-semibold text-navy">Beta Testing Notice</p>
            <p className="mt-2">Keffy is in early beta. Privacy practices may evolve as we add features. Your participation helps us improve our data handling. We prioritize your privacy and welcome feedback on this policy.</p>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">By using Keffy, you acknowledge that you have read and understood this Privacy Policy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
