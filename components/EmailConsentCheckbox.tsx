// components/EmailConsentCheckbox.tsx
// Add this to signup flow or account settings page

'use client';

import { useState } from 'react';

interface EmailConsentProps {
  defaultChecked?: boolean;
  onChange?: (consented: boolean) => void;
  variant?: 'signup' | 'settings';
}

export default function EmailConsentCheckbox({ 
  defaultChecked = false,
  onChange,
  variant = 'signup'
}: EmailConsentProps) {
  const [consented, setConsented] = useState(defaultChecked);

  const handleChange = (checked: boolean) => {
    setConsented(checked);
    onChange?.(checked);
  };

  return (
    <div className="space-y-4">
      {/* Main Consent Checkbox */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={consented}
          onChange={(e) => handleChange(e.target.checked)}
          className="mt-1 w-4 h-4 text-gold border-gray-300 rounded focus:ring-2 focus:ring-gold"
        />
        <div className="flex-1">
          <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
            {variant === 'signup' ? (
              <>
                <strong>Keep me updated!</strong> Send me product updates, 
                new features, and travel inspiration from Keffy.
              </>
            ) : (
              <>
                I want to receive product updates and travel inspiration from Keffy
              </>
            )}
          </span>
          <p className="text-xs text-gray-500 mt-1">
            You can unsubscribe anytime. We'll never spam you or share your email.
          </p>
        </div>
      </label>

      {/* Privacy Policy Link */}
      <p className="text-xs text-gray-500">
        By creating an account, you agree to our{' '}
        <a href="/terms" className="text-gold hover:underline">
          Terms & Conditions
        </a>{' '}
        and{' '}
        <a href="/privacy" className="text-gold hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}
