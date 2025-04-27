
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Products = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="container mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-8">Our Products</h1>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Add product cards here */}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
