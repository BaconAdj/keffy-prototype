import fs from 'fs';
import path from 'path';
import { marked } from 'marked';

export default function PrivacyPage() {
  const privacyPath = path.join(process.cwd(), 'PRIVACY-POLICY.md');
  const content = fs.readFileSync(privacyPath, 'utf8');
  const html = marked(content);
  
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 prose prose-lg">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
