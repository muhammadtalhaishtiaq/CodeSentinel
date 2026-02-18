import React from 'react';
import { Link } from 'react-router-dom';

const Documentation = () => {
  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-6 py-10">
        <div className="grid md:grid-cols-12 gap-8">
          <aside className="md:col-span-3">
            <div className="sticky top-10 space-y-6">
              <Link to="/" className="flex items-center gap-2">
                <img src="/images/logo.png" alt="CodeSentinel Logo" className="w-8 h-8" />
                <span className="text-sm font-semibold text-slate-900">CodeSentinel</span>
              </Link>
              <div>
                <h2 className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-4">Getting Started</h2>
                <ul className="space-y-2 text-slate-700">
                  <li><a href="#authentication" className="hover:text-slate-900">Authentication</a></li>
                  <li><a href="#providers" className="hover:text-slate-900">Provider Connections</a></li>
                  <li><a href="#azure-pat" className="hover:text-slate-900">Azure DevOps PAT</a></li>
                  <li><a href="#github-oauth" className="hover:text-slate-900">GitHub OAuth</a></li>
                  <li><a href="#bitbucket" className="hover:text-slate-900">Bitbucket</a></li>
                  <li><a href="#scan-flow" className="hover:text-slate-900">Scan Flow</a></li>
                </ul>
              </div>
            </div>
          </aside>

          <div className="md:col-span-5 space-y-10">
            <section id="authentication">
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">Authentication</h2>
              <p className="text-slate-600">
                Use your API key in the Authorization header. You can find your key in
                <Link to="/api-integrations" className="text-slate-900 underline decoration-slate-300 hover:decoration-slate-900"> API Integrations</Link>.
              </p>
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Example header: <span className="font-mono">Authorization: Bearer YOUR_API_KEY</span>
              </div>
            </section>

            <section id="providers">
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">Provider Connections</h2>
              <p className="text-slate-600 mb-4">
                Provider connections live in <Link to="/api-integrations" className="text-slate-900 underline decoration-slate-300 hover:decoration-slate-900">API Integrations</Link>.
                GitHub and Bitbucket use OAuth. Azure DevOps uses a Personal Access Token (PAT).
              </p>
              <div className="grid gap-3">
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="text-sm font-semibold">GitHub</div>
                  <div className="text-sm text-slate-600">OAuth connection with repo selection</div>
                </div>
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="text-sm font-semibold">Bitbucket</div>
                  <div className="text-sm text-slate-600">OAuth connection with repo selection</div>
                </div>
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="text-sm font-semibold">Azure DevOps</div>
                  <div className="text-sm text-slate-600">PAT connection (read-only scopes)</div>
                </div>
              </div>
            </section>

            <section id="azure-pat">
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">Azure DevOps: Create a PAT</h2>
              <ol className="space-y-2 text-slate-600 list-decimal list-inside">
                <li>Open Azure DevOps and click your profile icon.</li>
                <li>Select Personal access tokens.</li>
                <li>Click New Token.</li>
                <li>Name the token, set an expiration, and select scopes:</li>
              </ol>
              <ul className="mt-3 space-y-1 text-slate-600 list-disc list-inside">
                <li>Code: Read</li>
                <li>Project and Team: Read</li>
                <li>Build: Read (optional)</li>
              </ul>
              <p className="text-slate-600 mt-4">
                Paste the token into Azure DevOps in
                <Link to="/api-integrations" className="text-slate-900 underline decoration-slate-300 hover:decoration-slate-900"> API Integrations</Link>.
              </p>
            </section>

            <section id="github-oauth">
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">GitHub: OAuth Connection</h2>
              <ol className="space-y-2 text-slate-600 list-decimal list-inside">
                <li>Open <Link to="/api-integrations" className="text-slate-900 underline decoration-slate-300 hover:decoration-slate-900">API Integrations</Link>.</li>
                <li>Click Connect GitHub.</li>
                <li>Authorize CodeSentinel to access your repositories.</li>
                <li>Select the repositories you want to scan.</li>
              </ol>
            </section>

            <section id="bitbucket">
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">Bitbucket: Connect</h2>
              <ol className="space-y-2 text-slate-600 list-decimal list-inside">
                <li>Open <Link to="/api-integrations" className="text-slate-900 underline decoration-slate-300 hover:decoration-slate-900">API Integrations</Link>.</li>
                <li>Click Connect Bitbucket.</li>
                <li>Authorize CodeSentinel.</li>
                <li>Select the repositories you want to scan.</li>
              </ol>
            </section>

            <section id="scan-flow">
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">Scan Flow</h2>
              <ol className="space-y-2 text-slate-600 list-decimal list-inside">
                <li>Import a repository after connecting your provider.</li>
                <li>Open the project and click Start Scan.</li>
                <li>Review findings grouped by severity.</li>
                <li>Open a finding to see file location and AI fix guidance.</li>
                <li>Re-run the scan after applying fixes.</li>
              </ol>
            </section>
          </div>

          <aside className="md:col-span-4">
            <div className="sticky top-10">
              <div className="rounded-xl border border-slate-200 bg-slate-900 text-white overflow-hidden">
                <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3 text-xs uppercase tracking-widest text-slate-400">
                  <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-emerald-300">curl</span>
                  <span>python</span>
                  <span>node</span>
                  <span>go</span>
                  <span>ruby</span>
                </div>
                <div className="p-4 space-y-5">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Definition</div>
                    <div className="rounded-lg bg-slate-950 px-4 py-3 font-mono text-xs text-slate-200">
                      POST https://api.codesentinel.io/v1/scans
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Example Request</div>
                    <div className="rounded-lg bg-slate-950 px-4 py-3 font-mono text-xs text-emerald-300 whitespace-pre-wrap">
{`curl -X POST https://api.codesentinel.io/v1/scans \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "repository_url": "https://github.com/user/repo",
    "branch": "main"
  }'`}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Example Response</div>
                    <div className="rounded-lg bg-slate-950 px-4 py-3 font-mono text-xs text-slate-200 whitespace-pre-wrap">
{`{
  "scan_id": "scan_abc123",
  "status": "processing",
  "estimated_time": "5s"
}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Documentation;