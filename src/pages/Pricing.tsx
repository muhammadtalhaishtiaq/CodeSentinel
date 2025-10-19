
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Pricing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="container mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-8">Pricing Plans</h1>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Add pricing cards here */}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
