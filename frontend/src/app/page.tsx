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
  Clock, 
  BarChart3,
  Settings,
  Eye,
  ChevronDown,
  Play,
  Zap,
  Activity,
  AlertCircle,
  X
} from 'lucide-react';

// Types for API responses
interface ProcessingResult {
  message: string;
  filename: string;
  chunks?: number;
  total_tokens?: number;
  preview?: string[];
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
  const [isUploading, setIsUploading] = useState(false);
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

    setIsUploading(true);
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
    } finally {
      setIsUploading(false);
    }
  };

  // Download functionality
  const downloadResults = () => {
    if (!processingResult) return;

    // Create JSONL content
    const jsonlContent = processingResult.preview?.map((chunk, index) => 
      JSON.stringify({
        text: chunk,
        chunk_id: index + 1,
        tokens: Math.floor((processingResult.total_tokens || 131) / (processingResult.chunks || 1)),
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
  const CircularProgress = ({ percentage, size = 140 }: { percentage: number; size?: number }) => (
    <div className="relative inline-flex items-center justify-center">
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 8}
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          className="text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 8}
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={`${2 * Math.PI * (size / 2 - 8)}`}
          strokeDashoffset={`${2 * Math.PI * (size / 2 - 8) * (1 - percentage / 100)}`}
          className="text-[#FF6B47] transition-all duration-500 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-white">
          {Math.round(percentage)}%
        </span>
        <span className="text-xs text-gray-300 mt-1">
          {percentage < 30 && "Parsing"}
          {percentage >= 30 && percentage < 70 && "Cleaning"}
          {percentage >= 70 && "Chunking"}
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f1419]">
      {/* Header */}
      <header className="bg-[rgba(26,26,46,0.8)] border-b border-gray-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B47] to-[#E85555] rounded-lg flex items-center justify-center shadow-lg">
              <div className="w-6 h-6 border-2 border-white rounded transform rotate-12 opacity-90"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{APP_NAME}</h1>
              <p className="text-xs text-gray-400">AI Dataset Platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#4ECDC4]" />
              <span className="text-sm text-gray-300">
                {ENVIRONMENT === 'production' ? 'Production Ready' : 'Development Mode'}
              </span>
            </div>
            <div className="w-2 h-2 bg-[#4ECDC4] rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        
        {/* Hero Section */}
        <section className="text-center space-y-4 py-8">
          <h2 className="text-4xl font-bold text-white mb-2">
            Transform Documents into 
            <span className="bg-gradient-to-r from-[#FF6B47] to-[#4ECDC4] bg-clip-text text-transparent"> AI-Ready Datasets</span>
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Professional-grade document processing with intelligent chunking, 40+ file formats, and beautiful export options
          </p>
          {ENVIRONMENT === 'development' && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mx-auto max-w-md">
              <p className="text-yellow-300 text-sm">
                🚧 Development Mode - API: {API_BASE_URL}
              </p>
            </div>
          )}
        </section>

        {/* Upload Section */}
        {processingStep === 'upload' && (
          <section className="space-y-6">
            <div 
              className="relative border-2 border-dashed border-[#FF6B47] bg-[rgba(255,107,71,0.1)] hover:bg-[rgba(255,107,71,0.15)] rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer shadow-lg shadow-[rgba(255,107,71,0.2)]"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.docx,.txt,.md,.py,.js,.json,.csv,.pptx,.xlsx"
              />
              <div className="space-y-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#FF6B47] to-[#E85555] rounded-full flex items-center justify-center shadow-xl">
                  <Upload className="w-10 h-10 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white mb-2">
                    Drop files here or click to browse
                  </p>
                  <p className="text-gray-300">
                    PDF, DOCX, TXT, code files, presentations, or entire folders
                  </p>
                </div>
                <div className="space-y-4">
                  <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#FF6B47] to-[#E85555] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[rgba(255,107,71,0.3)] transition-all duration-300 transform hover:scale-105">
                    <Upload className="w-5 h-5 mr-3" />
                    Choose Files
                  </button>
                  <p className="text-sm text-gray-400">
                    or drag and drop your documents here
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Processing Section */}
        {processingStep === 'processing' && (
          <section className="space-y-6">
            <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 p-10">
              <div className="text-center space-y-8">
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-white">Processing Your Files</h3>
                  <p className="text-gray-400">Applying intelligent algorithms to transform your documents</p>
                  {selectedFiles.length > 0 && (
                    <p className="text-[#4ECDC4] font-medium">
                      Processing: {selectedFiles[0].name}
                    </p>
                  )}
                </div>
                
                <CircularProgress percentage={progress} />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-xl border transition-all duration-300 ${
                    progress > 20 
                      ? 'bg-[rgba(255,107,71,0.2)] border-[rgba(255,107,71,0.5)] text-[#FF6B47]' 
                      : 'bg-gray-800 border-gray-600 text-gray-500'
                  }`}>
                    <div className="flex items-center justify-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${progress > 20 ? 'bg-[#FF6B47] animate-pulse' : 'bg-gray-600'}`}></div>
                      <span className="font-medium">Parsing Documents</span>
                    </div>
                    <p className="text-xs mt-2 opacity-75">Extracting text and structure</p>
                  </div>
                  
                  <div className={`p-4 rounded-xl border transition-all duration-300 ${
                    progress > 50 
                      ? 'bg-[rgba(78,205,196,0.2)] border-[rgba(78,205,196,0.5)] text-[#4ECDC4]' 
                      : 'bg-gray-800 border-gray-600 text-gray-500'
                  }`}>
                    <div className="flex items-center justify-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${progress > 50 ? 'bg-[#4ECDC4] animate-pulse' : 'bg-gray-600'}`}></div>
                      <span className="font-medium">Smart Cleaning</span>
                    </div>
                    <p className="text-xs mt-2 opacity-75">Context-aware normalization</p>
                  </div>
                  
                  <div className={`p-4 rounded-xl border transition-all duration-300 ${
                    progress > 80 
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' 
                      : 'bg-gray-800 border-gray-600 text-gray-500'
                  }`}>
                    <div className="flex items-center justify-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${progress > 80 ? 'bg-blue-500 animate-pulse' : 'bg-gray-600'}`}></div>
                      <span className="font-medium">Intelligent Chunking</span>
                    </div>
                    <p className="text-xs mt-2 opacity-75">Token-aware splitting</p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-gray-300">
                    {progress < 30 && "Analyzing document structure and extracting content..."}
                    {progress >= 30 && progress < 60 && "Applying smart cleaning algorithms and normalizing text..."}
                    {progress >= 60 && progress < 90 && "Creating intelligent chunks with semantic boundaries..."}
                    {progress >= 90 && "Finalizing your AI-ready dataset..."}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Error Section */}
        {processingStep === 'error' && (
          <section className="space-y-6">
            <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-sm rounded-2xl shadow-xl border border-red-500/50 p-8">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Processing Error</h3>
                  <p className="text-gray-400 mb-4">
                    There was an issue processing your file. Please try again.
                  </p>
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300 text-sm">
                      <strong>Error details:</strong> {error}
                    </div>
                  )}
                  <div className="mt-4 text-xs text-gray-500">
                    API Endpoint: {API_BASE_URL}
                  </div>
                </div>
                <button
                  onClick={resetApp}
                  className="inline-flex items-center px-6 py-3 bg-[#FF6B47] hover:bg-[#E85555] text-white rounded-xl font-semibold transition-colors"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Try Again
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Results Section */}
        {processingStep === 'completed' && processingResult && (
          <section className="space-y-6">
            <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 p-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-[#4ECDC4] to-green-400 rounded-full flex items-center justify-center mr-4">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white">Processing Complete!</h3>
                  <p className="text-gray-400">Your AI-ready dataset is ready</p>
                  <p className="text-[#4ECDC4] text-sm mt-1">
                    File: {processingResult.filename}
                  </p>
                </div>
              </div>

              {/* Results Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-6 border border-green-500/30 text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {processingResult.chunks || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-300 mt-1">Chunks Created</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-6 border border-blue-500/30 text-center">
                  <div className="text-3xl font-bold text-blue-400">
                    {processingResult.total_tokens || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-300 mt-1">Total Tokens</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-6 border border-purple-500/30 text-center">
                  <div className="text-3xl font-bold text-purple-400">
                    Complete
                  </div>
                  <div className="text-sm text-gray-300 mt-1">Status</div>
                </div>
              </div>

              {/* Preview */}
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
                          {chunk}
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Chunk {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={resetApp}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#FF6B47] to-[#E85555] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[rgba(255,107,71,0.3)] transition-all duration-300 transform hover:scale-105"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Process More Files
                </button>
                <button 
                  onClick={downloadResults}
                  className="inline-flex items-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Results
                </button>
              </div>
            </div>
          </section>
        )}

        {/* File Details Section */}
        {selectedFiles.length > 0 && processingStep !== 'upload' && (
          <section className="space-y-4">
            <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Folder className="w-5 h-5 mr-2 text-[#4ECDC4]" />
                  Selected Files ({selectedFiles.length})
                </h3>
                <button 
                  onClick={() => setShowFileDetails(!showFileDetails)}
                  className="flex items-center px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-all duration-200 text-sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showFileDetails ? 'Hide' : 'Show'} Details
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 ${showFileDetails ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              {showFileDetails && (
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-600">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.name)}
                        <span className="font-medium text-white">{file.name}</span>
                      </div>
                      <span className="text-sm text-gray-400">{formatFileSize(file.size)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default WolfstitchApp;