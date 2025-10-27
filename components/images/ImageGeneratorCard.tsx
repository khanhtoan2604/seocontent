import React, { useState } from 'react';
import { generateImage } from '../../services/geminiService';
import type { ImageGenerationState } from '../../types';
import LoadingSpinner from '../LoadingSpinner';
import { DownloadIcon } from '../icons';

interface ImageGeneratorCardProps {
  prompt: string;
}

const ImageGeneratorCard: React.FC<ImageGeneratorCardProps> = ({ prompt }) => {
  const [state, setState] = useState<ImageGenerationState>({
    isLoading: false,
    imageUrl: null,
    error: null,
  });

  const handleGenerateImage = async () => {
    setState({ isLoading: true, imageUrl: null, error: null });
    try {
      const url = await generateImage(prompt);
      setState({ isLoading: false, imageUrl: url, error: null });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setState({ isLoading: false, imageUrl: null, error: errorMessage });
    }
  };

  const sanitizeFilename = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '_') // replace spaces with underscores
      .replace(/[^a-z0-9_]/g, '') // remove non-alphanumeric characters except underscore
      .slice(0, 50); // limit length
  };

  const handleDownload = () => {
    if (!state.imageUrl) return;
    const link = document.createElement('a');
    link.href = state.imageUrl;
    const filename = `${sanitizeFilename(prompt)}.jpeg`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200">
      <p className="text-sm text-slate-600 mb-3 font-medium italic">"{prompt}"</p>
      
      {state.imageUrl && (
        <div className="mb-4 rounded-lg overflow-hidden aspect-video relative group">
          <img src={state.imageUrl} alt={prompt} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
            <button
                onClick={handleDownload}
                className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-90 p-3 bg-white/80 backdrop-blur-sm rounded-full text-slate-900 hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Tải ảnh xuống"
            >
                <DownloadIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      {state.isLoading && (
        <div className="flex items-center justify-center h-48 bg-slate-100 rounded-lg mb-4">
          <div className="text-center">
            <LoadingSpinner />
            <p className="text-sm text-slate-500 mt-2">Đang tạo ảnh...</p>
          </div>
        </div>
      )}

      {state.error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md mb-4 text-sm" role="alert">
            <p className="font-bold">Không thể tạo ảnh</p>
            <p>{state.error}</p>
        </div>
      )}

      {!state.imageUrl && !state.isLoading && (
         <button
          onClick={handleGenerateImage}
          disabled={state.isLoading}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
        >
          {state.isLoading ? 'Đang tạo...' : 'Tạo ảnh này'}
        </button>
      )}

       {state.imageUrl && !state.isLoading && (
         <button
          onClick={handleGenerateImage}
          disabled={state.isLoading}
          className="w-full flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-200 disabled:cursor-not-allowed transition-colors"
        >
          Tạo lại ảnh
        </button>
       )}
    </div>
  );
};

export default ImageGeneratorCard;