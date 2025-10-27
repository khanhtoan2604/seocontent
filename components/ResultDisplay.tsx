import React from 'react';
import type { GenerationResult } from '../types';
import LoadingSpinner from './LoadingSpinner';
// FIX: Corrected import path for ImageGeneratorCard
import ImageGeneratorCard from './images/ImageGeneratorCard';

interface ResultDisplayProps {
  result: GenerationResult | null;
  isLoading: boolean;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center justify-center min-h-[400px]">
        <LoadingSpinner />
        <p className="mt-4 text-slate-600 font-medium">Đang tạo bài viết, vui lòng chờ trong giây lát...</p>
        <p className="mt-2 text-sm text-slate-500">Quá trình này có thể mất đến một phút.</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-slate-900">Nội dung bài viết sẽ hiển thị ở đây</h3>
            <p className="mt-1 text-sm text-slate-500">Điền thông tin vào biểu mẫu và bắt đầu tạo bài viết của bạn.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-8">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">{result.title}</h2>
        <div className="mb-6 space-y-2 text-sm text-slate-500">
            <p><strong className="font-semibold text-slate-700">Meta Description:</strong> {result.metaDescription}</p>
            <p><strong className="font-semibold text-slate-700">Slug:</strong> <code className="bg-slate-100 text-indigo-600 px-2 py-1 rounded-md text-xs">{result.slug}</code></p>
        </div>
        
        <article
          className="prose lg:prose-xl max-w-none text-slate-800"
          dangerouslySetInnerHTML={{ __html: result.content }}
        />
      </div>

      {result.imagePrompts && result.imagePrompts.length > 0 && (
        <div className="bg-slate-50 border-t border-slate-200 p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Tạo ảnh cho Website</h3>
            <div className="space-y-6">
                {result.imagePrompts.map((prompt, index) => (
                    <ImageGeneratorCard key={index} prompt={prompt} />
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;