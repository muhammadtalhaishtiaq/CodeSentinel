
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Company = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="container mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-8">About Our Company</h1>
          {/* Add company information here */}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Company;
