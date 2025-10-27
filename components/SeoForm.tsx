import React, { useState, useRef, useEffect } from 'react';
import type { FormData } from '../types';
// FIX: Corrected import path for icons
import { MagicWandIcon, UploadIcon, TrashIcon } from './icons';

interface SeoFormProps {
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
}

const SeoForm: React.FC<SeoFormProps> = ({ onSubmit, isLoading }) => {
  const [keyword, setKeyword] = useState<string>('');
  const [sampleUrl, setSampleUrl] = useState<string>('');
  const [generateImages, setGenerateImages] = useState<boolean>(true);
  const [wordCount, setWordCount] = useState<number>(1800);
  const [productImage, setProductImage] = useState<{
    base64: string;
    mimeType: string;
    previewUrl: string;
    name: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Cleanup function to revoke object URL to prevent memory leaks
    return () => {
      if (productImage) {
        URL.revokeObjectURL(productImage.previewUrl);
      }
    };
  }, [productImage]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // Gemini API has a 4MB limit for inline data
        alert("Kích thước tệp quá lớn. Vui lòng chọn ảnh nhỏ hơn 4MB.");
        return;
      }
      // Revoke previous URL if it exists
      if (productImage) {
        URL.revokeObjectURL(productImage.previewUrl);
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setProductImage({
          base64: base64String,
          mimeType: file.type,
          previewUrl: URL.createObjectURL(file),
          name: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveImage = () => {
    setProductImage(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input to allow re-uploading the same file
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!keyword.trim()) {
      alert('Vui lòng nhập từ khóa chính.');
      return;
    }
    const formData: FormData = { 
        keyword, 
        sampleUrl, 
        generateImages, 
        wordCount,
        productImage: productImage ? { base64: productImage.base64, mimeType: productImage.mimeType } : null,
    };
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg sticky top-8">
      <h2 className="text-xl font-bold text-slate-900 mb-4">Thông tin đầu vào</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="keyword" className="block text-sm font-medium text-slate-700 mb-1">
            Từ khóa chính <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
            placeholder="Ví dụ: máy lọc không khí"
            required
          />
        </div>
        <div>
          <label htmlFor="sampleUrl" className="block text-sm font-medium text-slate-700 mb-1">
            URL bài viết mẫu (tùy chọn)
          </label>
          <input
            type="url"
            id="sampleUrl"
            value={sampleUrl}
            onChange={(e) => setSampleUrl(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
            placeholder="https://example.com/sample-article"
          />
        </div>
        <div>
          <label htmlFor="wordCount" className="flex justify-between text-sm font-medium text-slate-700 mb-1">
            <span>Số lượng từ</span>
            <span className="font-semibold text-indigo-600">{wordCount} từ</span>
          </label>
          <input
            id="wordCount"
            type="range"
            min="1800"
            max="5000"
            step="100"
            value={wordCount}
            onChange={(e) => setWordCount(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700">
                Ảnh sản phẩm (tùy chọn)
            </label>
            {productImage ? (
                <div className="mt-2 relative">
                    <img src={productImage.previewUrl} alt="Xem trước sản phẩm" className="w-full h-auto rounded-lg object-cover max-h-60" />
                    <div className="absolute top-0 right-0">
                        <button type="button" onClick={handleRemoveImage} className="p-1.5 bg-white/70 backdrop-blur-sm rounded-bl-lg text-slate-600 hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors" aria-label="Xóa ảnh">
                           <TrashIcon className="h-5 w-5" />
                        </button>
                    </div>
                     <p className="text-xs text-slate-500 mt-1 truncate" title={productImage.name}>{productImage.name}</p>
                </div>
            ) : (
                <div 
                    className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md cursor-pointer hover:border-indigo-500 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                    tabIndex={0}
                    role="button"
                    aria-label="Tải ảnh sản phẩm lên"
                >
                    <div className="space-y-1 text-center">
                        <UploadIcon className="mx-auto h-12 w-12 text-slate-400" />
                        <div className="flex text-sm text-slate-600">
                            <p className="pl-1">Nhấn để tải ảnh lên</p>
                        </div>
                        <p className="text-xs text-slate-500">PNG, JPG, JPEG tối đa 4MB</p>
                    </div>
                    <input 
                        ref={fileInputRef}
                        id="file-upload" 
                        name="file-upload" 
                        type="file" 
                        className="sr-only" 
                        accept="image/png, image/jpeg"
                        onChange={handleImageUpload}
                    />
                </div>
            )}
        </div>
        
        <div className="flex items-center">
          <input
            id="generateImages"
            type="checkbox"
            checked={generateImages}
            onChange={(e) => setGenerateImages(e.target.checked)}
            className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="generateImages" className="ml-2 block text-sm text-slate-900">
            Tạo gợi ý hình ảnh?
          </label>
        </div>
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              'Đang xử lý...'
            ) : (
              <>
                <MagicWandIcon className="h-5 w-5 mr-2" />
                Tạo bài viết
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SeoForm;