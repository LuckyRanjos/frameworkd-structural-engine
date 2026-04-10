"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/components/UserContext";
import { Button, Card } from "@/components/design-system";

const LandingPage: React.FC = () => {
  const router = useRouter();

  const handleStartAnalysis = () => {
    // Navigate to sign in page
    router.push("/signin");
  };

  const handleSignIn = () => {
    router.push("/signin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f4ed] to-[#f3f0eb]">
      {/* Navigation */}
      <nav className="border-b border-neutral-200 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight text-amber-700">
            FRAMEWORKD
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/signin")}>
              Sign In
            </Button>
            <Button variant="primary" size="sm" onClick={handleStartAnalysis}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="space-y-8 animate-fade-in">
          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-tight">
              Make better decisions
              <br />
              <span className="text-amber-600">with structural clarity</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Frameworkd analyzes your decision framework using structural auditing. 
              Get AI-powered insights on decision quality, identify hidden tensions, 
              and unlock new perspectives on what matters most.
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center pt-4">
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartAnalysis}
              className="px-8 text-lg"
            >
              Start Free Analysis →
            </Button>
          </div>

          {/* Trust Signals */}
          <div className="pt-8 space-y-4">
            <p className="text-sm text-neutral-500 font-medium">TRUSTED BY</p>
            <div className="flex justify-center gap-12 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span className="text-neutral-700 font-medium">Decision Experts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span className="text-neutral-700 font-medium">Business Leaders</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span className="text-neutral-700 font-medium">Strategists</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white border-t border-neutral-200 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Structural clarity, made simple
            </h2>
            <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
              Our AI-powered analysis provides multiple perspectives on your decision quality
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="animate-scale-in" style={{ animationDelay: "0.1s" }}>
              <Card>
                <div className="space-y-4">
                  <div className="text-4xl">🎯</div>
                  <h3 className="text-xl font-semibold text-foreground">Deep Analysis</h3>
                  <p className="text-neutral-600">
                    Multi-step structural audit that uncovers hidden patterns and tensions in your decision framework.
                  </p>
                </div>
              </Card>
            </div>

            {/* Feature 2 */}
            <div className="animate-scale-in" style={{ animationDelay: "0.2s" }}>
              <Card>
                <div className="space-y-4">
                  <div className="text-4xl">🧠</div>
                <h3 className="text-xl font-semibold text-foreground">Insight synthesis</h3>
                <p className="text-neutral-600">
                  Multiple perspectives are synthesized into a single, coherent strategic assessment.
                  </p>
                </div>
              </Card>
            </div>

            {/* Feature 3 */}
            <div className="animate-scale-in" style={{ animationDelay: "0.3s" }}>
              <Card>
                <div className="space-y-4">
                  <div className="text-4xl">📊</div>
                <h3 className="text-xl font-semibold text-foreground">Actionable clarity</h3>
                <p className="text-neutral-600">
                  Receive a scorecard, key insights, and concrete next steps to improve decision quality.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-b from-[#f3f0eb] to-[#f8f4ed]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              How it works
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="font-semibold mb-2">Submit</h4>
              <p className="text-sm text-neutral-600">
                Describe your decision or business structure
              </p>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <div className="text-2xl text-amber-600">→</div>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="font-semibold mb-2">Analyze</h4>
              <p className="text-sm text-neutral-600">
                Multiple AIs audit your structure in parallel
              </p>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <div className="text-2xl text-amber-600">→</div>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="font-semibold mb-2">Insights</h4>
              <p className="text-sm text-neutral-600">
                Get scores, key insights, and next steps
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="sign-in" className="bg-white border-t border-neutral-200 py-24">
        <div className="max-w-2xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-4xl font-bold text-foreground">
            Ready to gain clarity?
          </h2>
          <p className="text-xl text-neutral-600">
            Start your first free analysis today. No credit card required.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={handleStartAnalysis}
            className="px-8 text-lg"
          >
            Start Free Analysis →
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-50 border-t border-neutral-200 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="col-span-1">
              <h3 className="font-bold text-lg text-amber-700 mb-4">FRAMEWORKD</h3>
              <p className="text-sm text-neutral-600">
                Structural clarity for better decisions.
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li>
                  <button onClick={handleStartAnalysis} className="hover:text-amber-600 transition">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={handleStartAnalysis} className="hover:text-amber-600 transition">
                    Pricing
                  </button>
                </li>
                <li>
                  <button onClick={handleStartAnalysis} className="hover:text-amber-600 transition">
                    Documentation
                  </button>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li>
                  <a href="#" className="hover:text-amber-600 transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-600 transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-600 transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li>
                  <a href="#" className="hover:text-amber-600 transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-600 transition">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-neutral-200 pt-8 flex items-center justify-between text-sm text-neutral-600">
            <p>&copy; 2026 Frameworkd. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-amber-600 transition">Twitter</a>
              <a href="#" className="hover:text-amber-600 transition">LinkedIn</a>
              <a href="#" className="hover:text-amber-600 transition">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
