
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-bloom-primary shadow-md py-4 px-6">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-3xl font-cursive text-white">ShaFlo</h1>
        <p className="text-white text-sm hidden md:block">For Sharlene from Jackson, with love ❤️</p>
      </div>
    </header>
  );
};