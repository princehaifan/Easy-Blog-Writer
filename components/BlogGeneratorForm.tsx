import React, { useState } from 'react';
import { LANGUAGES } from '../constants';

interface BlogGeneratorFormProps {
    onGenerate: (title: string, language: string, keywords: string) => void;
    isLoading: boolean;
}

export const BlogGeneratorForm: React.FC<BlogGeneratorFormProps> = ({ onGenerate, isLoading }) => {
    const [title, setTitle] = useState('');
    const [language, setLanguage] = useState('en');
    const [keywords, setKeywords] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate(title, language, keywords);
    };

    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8 border border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                        Blog Title
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., 'The Future of Renewable Energy'"
                        className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-300 mb-1">
                        Language
                    </label>
                    <select
                        id="language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                    >
                        {LANGUAGES.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                                {lang.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="keywords" className="block text-sm font-medium text-gray-300 mb-1">
                        SEO Keywords (comma-separated)
                    </label>
                    <input
                        id="keywords"
                        type="text"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        placeholder="e.g., solar power, wind energy, sustainability"
                        className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Generating...' : '✨ Generate Blog'}
                </button>
            </form>
        </div>
    );
};