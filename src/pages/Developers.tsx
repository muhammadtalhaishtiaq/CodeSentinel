
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Developers = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="container mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-8">For Developers</h1>
          {/* Add developer resources content here */}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Developers;
