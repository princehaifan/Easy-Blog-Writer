import React from 'react';

export const Header: React.FC = () => (
    <header className="text-center mb-8 md:mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-2">
            Easy Blog Writer 🎉
        </h1>
        <p className="text-lg md:text-xl text-gray-400">
            Generate detailed, SEO-optimized blogs with just a few clicks.
        </p>
    </header>
);
