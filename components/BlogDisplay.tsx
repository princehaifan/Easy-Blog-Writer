import React from 'react';
import { BlogSectionData } from '../types';
import { BlogSection } from './BlogSection';

interface BlogDisplayProps {
    sections: BlogSectionData[];
    onUpdateSectionContent: (id: string, newContent: string) => void;
    onRegenerateSection: (id: string, sectionTitle: string) => void;
    onRegenerateImage: (id: string, imagePrompt: string) => void;
    onMoveSection: (index: number, direction: 'up' | 'down') => void;
    onDeleteSection: (id: string) => void;
    onExport: () => void;
}

export const BlogDisplay: React.FC<BlogDisplayProps> = ({ 
    sections, 
    onUpdateSectionContent, 
    onRegenerateSection, 
    onRegenerateImage,
    onMoveSection,
    onDeleteSection,
    onExport
}) => {

    return (
        <>
            <div className="flex justify-end mb-4">
                <button
                    onClick={onExport}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
                >
                    Export as .txt
                </button>
            </div>
            <article className="prose prose-invert prose-lg max-w-none bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 border border-gray-700">
                {sections.map((section, index) => (
                    <BlogSection
                        key={section.id}
                        section={section}
                        index={index}
                        totalSections={sections.length}
                        onUpdateContent={onUpdateSectionContent}
                        onRegenerateSection={onRegenerateSection}
                        onRegenerateImage={onRegenerateImage}
                        onMove={onMoveSection}
                        onDelete={onDeleteSection}
                    />
                ))}
            </article>
        </>
    );
};