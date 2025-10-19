
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Partners = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="container mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-8">Partner With Us</h1>
          {/* Add partners content here */}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Partners;
