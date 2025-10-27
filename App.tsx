import React, { useState } from 'react';
import SeoForm from './components/SeoForm';
import ResultDisplay from './components/ResultDisplay';
import { generateSeoArticle } from './services/geminiService';
import type { FormData, GenerationResult } from './types';

function App() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const generationResult = await generateSeoArticle(formData);
      setResult(generationResult);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-slate-900">AI SEO Article Generator</h1>
          <p className="text-sm text-slate-500">Powered by Google Gemini</p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1">
            <SeoForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-2">
            <ResultDisplay result={result} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
