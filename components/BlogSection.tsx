import React, { useState, useRef, useEffect } from 'react';
import { BlogSectionData } from '../types';
import { EditIcon } from './icons/EditIcon';
import { SaveIcon } from './icons/SaveIcon';
import { GenerateIcon } from './icons/GenerateIcon';
import { ImageIcon } from './icons/ImageIcon';
import { MoveUpIcon } from './icons/MoveUpIcon';
import { MoveDownIcon } from './icons/MoveDownIcon';
import { DeleteIcon } from './icons/DeleteIcon';
import { Spinner } from './Spinner';

interface BlogSectionProps {
    section: BlogSectionData;
    index: number;
    totalSections: number;
    onUpdateContent: (id: string, newContent: string) => void;
    onRegenerateSection: (id: string, sectionTitle: string) => void;
    onRegenerateImage: (id: string, imagePrompt: string) => void;
    onMove: (index: number, direction: 'up' | 'down') => void;
    onDelete: (id: string) => void;
}

const ActionButton: React.FC<{ onClick: () => void, children: React.ReactNode, title: string }> = ({ onClick, children, title }) => (
    <button
        onClick={onClick}
        title={title}
        className="p-2 rounded-full bg-gray-700 hover:bg-purple-600 text-gray-300 hover:text-white transition-colors duration-200"
    >
        {children}
    </button>
);

export const BlogSection: React.FC<BlogSectionProps> = ({ 
    section, 
    index,
    totalSections,
    onUpdateContent,
    onRegenerateSection, 
    onRegenerateImage,
    onMove,
    onDelete
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(section.content);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [isSectionLoading, setIsSectionLoading] = useState(false);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setEditedContent(section.content);
        setIsSectionLoading(false);
    }, [section.content]);

    useEffect(() => {
        setIsImageLoading(false);
    }, [section.imageUrl]);

    useEffect(() => {
        if (isEditing && textAreaRef.current) {
            textAreaRef.current.style.height = 'auto';
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
        }
    }, [isEditing, editedContent]);

    const handleSave = () => {
        onUpdateContent(section.id, editedContent);
        setIsEditing(false);
    };

    const handleRegenerateImageClick = async () => {
        setIsImageLoading(true);
        await onRegenerateImage(section.id, section.imagePrompt);
    };
    
    const handleRegenerateSectionClick = async () => {
        setIsSectionLoading(true);
        await onRegenerateSection(section.id, section.title);
    };

    return (
        <div className="group relative py-4 border-b border-gray-700 last:border-b-0">
            <div className="absolute top-2 right-2 flex items-center space-x-2 bg-gray-900/50 backdrop-blur-sm p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ActionButton onClick={() => onMove(index, 'up')} title="Move Up"><MoveUpIcon /></ActionButton>
                <ActionButton onClick={() => onMove(index, 'down')} title="Move Down"><MoveDownIcon /></ActionButton>
                <ActionButton onClick={() => isEditing ? handleSave() : setIsEditing(true)} title={isEditing ? 'Save' : 'Edit Text'}>
                    {isEditing ? <SaveIcon /> : <EditIcon />}
                </ActionButton>
                <ActionButton onClick={handleRegenerateSectionClick} title="Regenerate Text"><GenerateIcon /></ActionButton>
                <ActionButton onClick={handleRegenerateImageClick} title="Regenerate Image"><ImageIcon /></ActionButton>
                <ActionButton onClick={() => onDelete(section.id)} title="Delete Section"><DeleteIcon /></ActionButton>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-100">{section.title}</h2>
            
            {section.imageUrl || isImageLoading ? (
                <div className="relative mb-6 aspect-video bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                    {isImageLoading ? <Spinner /> : <img src={section.imageUrl!} alt={section.title} className="w-full h-full object-cover" />}
                </div>
            ) : null}

            <div className="text-gray-300 leading-relaxed">
                 {isSectionLoading ? (
                    <div className="flex items-center justify-center p-8"><Spinner /></div>
                 ) : isEditing ? (
                    <textarea
                        ref={textAreaRef}
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full bg-gray-700 border-gray-600 rounded-md p-3 text-gray-100 focus:ring-2 focus:ring-purple-500 transition resize-none overflow-hidden"
                    />
                ) : (
                    <p className="whitespace-pre-wrap">{section.content}</p>
                )}
            </div>
        </div>
    );
};
