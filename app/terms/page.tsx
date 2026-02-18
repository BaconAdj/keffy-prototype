import fs from 'fs';
import path from 'path';
import { marked } from 'marked';

export default function TermsPage() {
  const termsPath = path.join(process.cwd(), 'TERMS-AND-CONDITIONS.md');
  const content = fs.readFileSync(termsPath, 'utf8');
  const html = marked(content);
  
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 prose prose-lg">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
