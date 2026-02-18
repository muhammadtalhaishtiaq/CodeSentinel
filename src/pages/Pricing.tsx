import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight, X, Zap, Shield, Lock, Clock } from 'lucide-react';

const Pricing = () => {
  const tiers = [
    {
      name: 'Free',
      price: 0,
      period: '/month',
      description: 'Full SAST scanning for solo developers',
      cta: 'Start Free',
      badge: 'FULL SAST',
      highlight: false,
      features: [
        { text: 'Unlimited repositories', included: true },
        { text: 'Unlimited SAST scans (14+ languages)', included: true },
        { text: 'GitHub integration (manual scans)', included: true },
        { text: 'AI explanations (shared LLM key)', included: true },
        { text: 'Project access control', included: true },
        { text: 'Encrypted credential storage', included: true },
        { text: 'Bring your own LLM key', included: false },
        { text: 'PR automation (Q2 2026)', included: false },
        { text: 'SCA dependency scanning (Q2 2026)', included: false },
        { text: 'Container + IaC scanning (Roadmap)', included: false },
      ],
    },
    {
      name: 'Pro',
      price: 5,
      period: '/month',
      description: 'For power users who want full AI control',
      cta: 'Go Pro',
      badge: 'MOST POPULAR',
      highlight: true,
      features: [
        { text: 'Everything in Free', included: true },
        { text: 'Bring your own LLM key (unlimited AI)', included: true },
        { text: 'Priority email support', included: true },
        { text: 'Early access to PR automation (Q2 2026)', included: true },
        { text: 'Early access to SCA scanning (Q2 2026)', included: true },
        { text: 'Roadmap access: Container + IaC scanning', included: true },
        { text: 'Roadmap access: CI/CD integrations', included: true },
      ],
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For orgs with compliance and security programs',
      cta: 'Contact Sales',
      badge: null,
      highlight: false,
      features: [
        { text: 'Everything in Pro', included: true },
        { text: 'Custom contracts and invoicing', included: true },
        { text: 'Dedicated onboarding and security review', included: true },
        { text: 'SLA and priority support', included: true },
        { text: 'SSO/SCIM (Roadmap)', included: true },
        { text: 'On-prem deployment (Roadmap)', included: true },
      ],
    },
  ];

  const formatPrice = (price: number | string) =>
    typeof price === 'number' ? `$${price}` : price;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero */}
        <section className="bg-gradient-to-br from-indigo-600 to-indigo-700 py-20">
          <div className="container mx-auto px-6 text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Security That Doesn&apos;t Break the Bank
            </h1>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto mb-6">
              Flat pricing with no per-developer fees. Start free, then upgrade for full AI control and early access.
            </p>
            <div className="flex justify-center gap-4 text-sm text-indigo-100">
              <span className="flex items-center gap-2"><Zap className="h-4 w-4" /> Fast SAST scans</span>
              <span className="flex items-center gap-2"><Shield className="h-4 w-4" /> Secure by default</span>
              <span className="flex items-center gap-2"><Lock className="h-4 w-4" /> BYOK LLM keys</span>
            </div>
          </div>
        </section>

        {/* Pricing Tiers */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Plan</h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Start free. Upgrade when you need more power. Cancel anytime.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {tiers.map((tier, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl overflow-hidden transition ${
                    tier.highlight
                      ? 'ring-2 ring-indigo-500 shadow-2xl md:scale-105'
                      : 'border border-slate-200 hover:shadow-lg'
                  }`}
                >
                  {/* Header */}
                  <div className={`p-8 text-center ${tier.highlight ? 'bg-indigo-50' : 'bg-slate-50'}`}>
                    {tier.badge && (
                      <Badge className="mb-4 bg-indigo-600 text-white">{tier.badge}</Badge>
                    )}
                    <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                    <p className="text-sm text-slate-600 mb-6">{tier.description}</p>
                    <div className="flex items-baseline justify-center gap-1 mb-6">
                      <span className="text-4xl font-bold">{formatPrice(tier.price)}</span>
                      {tier.period && <span className="text-slate-600">{tier.period}</span>}
                    </div>
                    <Link to={tier.name === 'Enterprise' ? '#contact' : '/register'}>
                      <Button
                        className="w-full"
                        variant={tier.highlight ? 'default' : 'outline'}
                      >
                        {tier.cta}
                        {tier.name !== 'Enterprise' && <ArrowRight className="ml-2 h-4 w-4" />}
                      </Button>
                    </Link>
                  </div>

                  {/* Features */}
                  <div className="p-8 space-y-4">
                    {tier.features.map((feature, fidx) => (
                      <div key={fidx} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                            tier.highlight ? 'text-indigo-600' : 'text-green-600'
                          }`} />
                        ) : (
                          <X className="h-5 w-5 text-slate-300 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? '' : 'text-slate-400'}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Why Upgrade?</h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white p-8 rounded-xl shadow-sm border">
                <div className="bg-indigo-100 p-3 rounded-lg w-fit mb-4">
                  <Zap className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Unlimited AI Control</h3>
                <p className="text-slate-600 mb-4">
                  Bring your own LLM key for OpenAI, Claude, or Gemini to remove shared limits and unlock full AI usage.
                </p>
                <p className="text-sm text-slate-500 font-semibold">
                  💡 Free uses a shared LLM key
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm border">
                <div className="bg-emerald-100 p-3 rounded-lg w-fit mb-4">
                  <Clock className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Roadmap Access</h3>
                <p className="text-slate-600 mb-4">
                  Early access to PR automation, scheduled scans, and dependency scanning as they ship in Q2 2026.
                </p>
                <p className="text-sm text-slate-500 font-semibold">
                  🔧 Free stays on manual scans
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm border">
                <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Enterprise-Ready Support</h3>
                <p className="text-slate-600 mb-4">
                  Get onboarding help, priority support, and custom contracts for compliance-driven teams.
                </p>
                <p className="text-sm text-slate-500 font-semibold">
                  🧩 SSO/SCIM available on the roadmap
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Flat Pricing Comparison */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Flat Pricing vs Per-Seat Pricing</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white p-8 rounded-xl border border-rose-200 shadow-sm">
                <div className="text-rose-600 font-bold text-sm mb-2">TRADITIONAL ENTERPRISE TOOLS</div>
                <div className="space-y-3 mb-6">
                  <div>
                    <p className="text-sm text-slate-600">Per-developer pricing</p>
                    <p className="text-2xl font-bold">$25-$100/dev/month</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">10 developers</p>
                    <p className="text-2xl font-bold text-rose-600">$250-$1,000/month</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Costs rise with every new engineer added.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl border-2 border-green-500 shadow-sm">
                <div className="text-green-600 font-bold text-sm mb-2">CODESENTINEL</div>
                <div className="space-y-3 mb-6">
                  <div>
                    <p className="text-sm text-slate-600">Flat monthly rate</p>
                    <p className="text-2xl font-bold">$5/month (Pro)</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">No per-seat fees</p>
                    <p className="text-2xl font-bold text-green-600">Scale without surprise costs</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Predictable pricing with a clear upgrade path.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Live vs Roadmap */}
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What&apos;s Live vs What&apos;s Next</h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                We keep the roadmap transparent so you know exactly what you&apos;re getting.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="bg-white p-8 rounded-xl shadow-sm border">
                <Badge className="bg-green-500 text-white mb-4">Live Today</Badge>
                <ul className="space-y-3 text-slate-700">
                  <li className="flex items-start gap-2"><Check className="h-5 w-5 text-green-500 mt-0.5" /> SAST scanning for 14+ languages</li>
                  <li className="flex items-start gap-2"><Check className="h-5 w-5 text-green-500 mt-0.5" /> GitHub integration with manual scans</li>
                  <li className="flex items-start gap-2"><Check className="h-5 w-5 text-green-500 mt-0.5" /> AI explanations and fix guidance</li>
                  <li className="flex items-start gap-2"><Check className="h-5 w-5 text-green-500 mt-0.5" /> Encrypted credentials and access controls</li>
                </ul>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm border">
                <Badge className="bg-amber-500 text-white mb-4">Roadmap</Badge>
                <ul className="space-y-3 text-slate-700">
                  <li className="flex items-start gap-2"><Clock className="h-5 w-5 text-amber-500 mt-0.5" /> PR automation + scheduled scans (Q2 2026)</li>
                  <li className="flex items-start gap-2"><Clock className="h-5 w-5 text-amber-500 mt-0.5" /> SCA dependency scanning (Q2 2026)</li>
                  <li className="flex items-start gap-2"><Clock className="h-5 w-5 text-amber-500 mt-0.5" /> Container + IaC scanning (Q3 2026)</li>
                  <li className="flex items-start gap-2"><Clock className="h-5 w-5 text-amber-500 mt-0.5" /> IDE extensions + CSPM (Q4 2026)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-8">
              <div>
                <h3 className="text-lg font-bold mb-3">Are there any repo limits on Free?</h3>
                <p className="text-slate-600">
                  No. Free includes unlimited repositories and full SAST scans. Upgrade for BYOK AI and roadmap access.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-3">What does BYOK mean?</h3>
                <p className="text-slate-600">
                  Bring Your Own Key. Use your own OpenAI, Claude, or Gemini API key for unlimited AI usage.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-3">When do automation and SCA launch?</h3>
                <p className="text-slate-600">
                  PR automation and dependency scanning are planned for Q2 2026. Pro and Enterprise get early access as they ship.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-3">Can I cancel anytime?</h3>
                <p className="text-slate-600">
                  Absolutely. Cancel your subscription anytime without penalties. Your access continues until the end of your billing period.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-3">Do you offer annual billing?</h3>
                <p className="text-slate-600">
                  Yes. Annual plans are available with discounts. Contact sales for Enterprise pricing details.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-indigo-600 py-16">
          <div className="container mx-auto px-6 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Secure Your Code?</h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Start free today. No credit card required. Upgrade when you&apos;re ready.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50">
                  Start Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/docs">
                <Button size="lg" variant="outline" className="border-white text-white bg-indigo-500/20 hover:bg-indigo-500">
                  View Documentation
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;