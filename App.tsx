import React, { useState, useCallback } from 'react';
import { BlogSectionData } from './types';
import { generateBlogFromTitle, generateSectionContent, generateImageForSection } from './services/geminiService';
import { Header } from './components/Header';
import { BlogGeneratorForm } from './components/BlogGeneratorForm';
import { BlogDisplay } from './components/BlogDisplay';
import { Spinner } from './components/Spinner';

const App: React.FC = () => {
    const [blogContent, setBlogContent] = useState<BlogSectionData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    
    // Store generation parameters for reuse
    const [blogTitle, setBlogTitle] = useState<string>('');
    const [blogLanguage, setBlogLanguage] = useState<string>('en');
    const [blogKeywords, setBlogKeywords] = useState<string>('');


    const handleGenerateBlog = useCallback(async (title: string, language: string, keywords: string) => {
        if (!title) {
            setError('Please enter a blog title.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setBlogContent([]);

        // Store parameters
        setBlogTitle(title);
        setBlogLanguage(language);
        setBlogKeywords(keywords);

        try {
            setLoadingMessage('Generating blog outline...');
            const sections = await generateBlogFromTitle(title, language, keywords);
            setBlogContent(sections); // Show content as it's generated
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred during blog generation.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, []);

    const handleUpdateSectionContent = useCallback((id: string, newContent: string) => {
        setBlogContent(prev => prev.map(section => section.id === id ? { ...section, content: newContent } : section));
    }, []);

    const handleRegenerateSection = useCallback(async (id: string, sectionTitle: string) => {
        try {
            // Use stored parameters for regeneration
            const newContent = await generateSectionContent(sectionTitle, blogTitle, blogLanguage, blogKeywords);
            handleUpdateSectionContent(id, newContent);
        } catch (err) {
            console.error('Failed to regenerate section content:', err);
            setError('Failed to regenerate section content. Please try again.');
        }
    }, [handleUpdateSectionContent, blogTitle, blogLanguage, blogKeywords]);
    
    const handleRegenerateImage = useCallback(async (id: string, imagePrompt: string) => {
        try {
            const newImageUrl = await generateImageForSection(imagePrompt);
            setBlogContent(prev => prev.map(section => section.id === id ? { ...section, imageUrl: newImageUrl } : section));
        } catch (err) {
            console.error('Failed to regenerate image:', err);
            setError('Failed to regenerate image. Please try again.');
        }
    }, []);

    const handleMoveSection = useCallback((index: number, direction: 'up' | 'down') => {
        setBlogContent(prev => {
            const newContent = [...prev];
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            if (targetIndex < 0 || targetIndex >= newContent.length) {
                return newContent;
            }
            [newContent[index], newContent[targetIndex]] = [newContent[targetIndex], newContent[index]];
            return newContent;
        });
    }, []);

    const handleDeleteSection = useCallback((id: string) => {
        setBlogContent(prev => prev.filter(section => section.id !== id));
    }, []);

    const handleExportBlog = useCallback(() => {
        if (blogContent.length === 0) return;

        const header = `# ${blogTitle}\n\n`;

        const blogText = blogContent.map(section => 
            `## ${section.title}\n\n${section.content}`
        ).join('\n\n---\n\n');

        const fullText = header + blogText;

        const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileName = `${blogTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'blog_post'}.txt`;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [blogContent, blogTitle]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Header />
                <main>
                    <BlogGeneratorForm onGenerate={handleGenerateBlog} isLoading={isLoading} />
                    {error && (
                        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative my-4" role="alert">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center my-12">
                            <Spinner />
                            <p className="mt-4 text-lg text-gray-400 animate-pulse">{loadingMessage}</p>
                        </div>
                    )}
                    {blogContent.length > 0 && (
                        <BlogDisplay 
                            sections={blogContent}
                            onUpdateSectionContent={handleUpdateSectionContent}
                            onRegenerateSection={handleRegenerateSection}
                            onRegenerateImage={handleRegenerateImage}
                            onMoveSection={handleMoveSection}
                            onDeleteSection={handleDeleteSection}
                            onExport={handleExportBlog}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

export default App;