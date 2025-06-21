'use client';

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  File, 
  Folder, 
  Code, 
  FileText, 
  Download, 
  CheckCircle, 
  Eye,
  ChevronDown,
  Zap,
  Activity,
  AlertCircle
} from 'lucide-react';

// Updated types for API responses - fixing the preview structure
interface PreviewChunk {
  text: string;
  tokens: number;
}

interface ProcessingResult {
  message: string;
  filename: string;
  chunks?: number;
  total_tokens?: number;
  preview?: PreviewChunk[]; // Changed from string[] to PreviewChunk[]
  error?: string;
  status?: string;
}

const WolfstitchApp = () => {
  // State management
  const [processingStep, setProcessingStep] = useState<'upload' | 'processing' | 'completed' | 'error'>('upload');
  const [progress, setProgress] = useState(0);
  const [showFileDetails, setShowFileDetails] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Configuration - Now using environment variables
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.wolfstitch.dev';
  const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Wolfstitch';
  const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development';

  // File processing function
  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setError(null);
    setProcessingStep('processing');
    setProgress(0);

    try {
      // Animate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      // Process the first file
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tokenizer', 'word-estimate');
      formData.append('max_tokens', '1024');

      console.log(`Processing file with API: ${API_BASE_URL}`);
      console.log('FormData contents:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      const fullURL = `${API_BASE_URL}/api/v1/quick-process`;
      console.log('Full API URL:', fullURL);

      const response = await fetch(fullURL, {
        method: 'POST',
        body: formData,
        mode: 'cors',
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const result: ProcessingResult = await response.json();
      
      setProgress(100);
      setProcessingResult(result);
      
      setTimeout(() => {
        setProcessingStep('completed');
      }, 500);

      console.log('Processing completed successfully:', result);

    } catch (error) {
      console.error('Processing error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setProcessingStep('error');
    }
  };

  // Download functionality - Fixed to handle the new preview structure
  const downloadResults = () => {
    if (!processingResult) return;

    // Create JSONL content from the preview chunks
    const jsonlContent = processingResult.preview?.map((chunk, index) => 
      JSON.stringify({
        text: chunk.text, // Extract text from the chunk object
        chunk_id: index + 1,
        tokens: chunk.tokens, // Use actual token count from chunk
        metadata: {
          filename: processingResult.filename,
          processed_at: new Date().toISOString()
        }
      })
    ).join('\n') || '';

    // Create and download file
    const blob = new Blob([jsonlContent], { type: 'application/jsonl' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${processingResult.filename.replace(/\.[^/.]+$/, '')}_processed.jsonl`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('Download initiated:', link.download);
  };

  // File selection handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    setSelectedFiles(files);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  // Reset to initial state
  const resetApp = () => {
    setProcessingStep('upload');
    setProgress(0);
    setSelectedFiles([]);
    setProcessingResult(null);
    setError(null);
    setShowFileDetails(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon based on extension
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-400" />;
      case 'docx': case 'doc': return <FileText className="w-5 h-5 text-blue-400" />;
      case 'pptx': case 'ppt': return <FileText className="w-5 h-5 text-orange-400" />;
      case 'xlsx': case 'xls': return <FileText className="w-5 h-5 text-green-400" />;
      case 'txt': case 'md': case 'markdown': return <FileText className="w-5 h-5 text-gray-400" />;
      case 'py': case 'js': case 'ts': case 'json': return <Code className="w-5 h-5 text-purple-400" />;
      default: return <File className="w-5 h-5 text-gray-400" />;
    }
  };

  // Circular progress component
  const CircularProgress = ({ percentage, size = 140 }: { percentage: number; size?: number }) => {
    const radius = (size - 16) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(75, 85, 99, 0.3)"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-in-out"
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF6B47" />
              <stop offset="100%" stopColor="#4ECDC4" />
            </linearGradient>
          </defs>
        </svg>
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-[#FF6B47] to-[#4ECDC4] rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">{APP_NAME}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-300">
                <Activity className="w-4 h-4 text-[#4ECDC4]" />
                <span>Status: Online</span>
              </div>
              {ENVIRONMENT === 'development' && (
                <div className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded text-xs text-yellow-300">
                  DEV
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Upload Section */}
        {processingStep === 'upload' && (
          <section className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
                Transform Documents into
                <span className="bg-gradient-to-r from-[#FF6B47] to-[#4ECDC4] bg-clip-text text-transparent"> AI Training Data</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Upload any document and get perfectly chunked, tokenized JSONL files ready for machine learning.
              </p>
            </div>

            {/* Upload Area */}
            <div
              className="relative border-2 border-dashed border-gray-600 hover:border-[#4ECDC4] rounded-2xl p-12 transition-colors duration-300 cursor-pointer bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)]"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.docx,.doc,.txt,.md,.html,.csv,.json,.xlsx,.xls,.pptx,.ppt"
              />
              
              <div className="space-y-6">
                <div className="w-20 h-20 bg-gradient-to-r from-[#FF6B47] to-[#4ECDC4] rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-10 h-10 text-white" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    Upload Your Document
                  </h3>
                  <p className="text-gray-400">
                    or drag and drop your documents here
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Processing Section */}
        {processingStep === 'processing' && (
          <section className="text-center space-y-8">
            <div className="flex flex-col items-center space-y-8">
              <CircularProgress percentage={progress} />
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">
                  Processing Your Document
                </h3>
                <p className="text-gray-300">
                  Parsing content, cleaning text, and creating intelligent chunks...
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Error Section */}
        {processingStep === 'error' && (
          <section className="text-center space-y-6">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">
                  Processing Failed
                </h3>
                <p className="text-gray-300 max-w-md mx-auto">
                  {error || 'Something went wrong while processing your file. Please try again.'}
                </p>
              </div>
              <button
                onClick={resetApp}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#FF6B47] to-[#E85555] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[rgba(255,107,71,0.3)] transition-all duration-300 transform hover:scale-105"
              >
                Try Again
              </button>
            </div>
          </section>
        )}

        {/* Success Section */}
        {processingStep === 'completed' && processingResult && (
          <section className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-[#4ECDC4]/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-[#4ECDC4]" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                Processing Complete!
              </h3>
              <p className="text-gray-300">
                Your document has been successfully processed and chunked
              </p>
            </div>

            {/* Results Summary */}
            <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#FF6B47] mb-1">
                    {processingResult.chunks || 0}
                  </div>
                  <div className="text-sm text-gray-300">Chunks Created</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#4ECDC4] mb-1">
                    {processingResult.total_tokens?.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm text-gray-300">Total Tokens</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">
                    {Math.round((processingResult.total_tokens || 0) / (processingResult.chunks || 1))}
                  </div>
                  <div className="text-sm text-gray-300">Avg Tokens/Chunk</div>
                </div>
              </div>

              {/* Preview - Fixed to handle new structure */}
              {processingResult.preview && processingResult.preview.length > 0 && (
                <div className="bg-gray-800/50 rounded-xl p-6 mb-8 border border-gray-600">
                  <h4 className="font-semibold text-white mb-4 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-[#4ECDC4]" />
                    Preview (First Chunks)
                  </h4>
                  <div className="space-y-4">
                    {processingResult.preview.slice(0, 3).map((chunk, index) => (
                      <div key={index} className="bg-gray-900 rounded-lg border border-gray-700 p-4">
                        <div className="font-mono text-sm text-gray-300 leading-relaxed">
                          {chunk.text} {/* Extract text from chunk object */}
                        </div>
                        <div className="mt-2 text-xs text-gray-500 flex justify-between">
                          <span>Chunk {index + 1}</span>
                          <span>{chunk.tokens} tokens</span> {/* Show actual token count */}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={downloadResults}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#4ECDC4] to-[#45B7B8] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[rgba(78,205,196,0.3)] transition-all duration-300 transform hover:scale-105"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download JSONL
                </button>
                <button
                  onClick={resetApp}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#FF6B47] to-[#E85555] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[rgba(255,107,71,0.3)] transition-all duration-300 transform hover:scale-105"
                >
                  Process Another File
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black/20 border-t border-gray-700 mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>© 2025 {APP_NAME}. Transforming documents into AI training data.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WolfstitchApp;