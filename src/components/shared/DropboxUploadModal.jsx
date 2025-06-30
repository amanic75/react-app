import React, { useState } from 'react';
import { X, Upload, File, Check, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';

const DropboxUploadModal = ({ isOpen, onClose }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error

  const handleLogin = () => {
    // Simulate login process
    setTimeout(() => {
      setIsLoggedIn(true);
    }, 1000);
  };

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const fileObjects = selectedFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    setFiles(prev => [...prev, ...fileObjects]);
  };

  const handleUpload = () => {
    setUploadStatus('uploading');
    // Simulate upload process
    setTimeout(() => {
      setUploadStatus('success');
      setTimeout(() => {
        setUploadStatus('idle');
        setFiles([]);
      }, 2000);
    }, 2000);
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 2L12 6L6 10L0 6L6 2ZM18 2L24 6L18 10L12 6L18 2ZM0 14L6 10L12 14L6 18L0 14ZM18 10L24 14L18 18L12 14L18 10ZM6 21L12 17L18 21L12 24L6 21Z"/>
            </svg>
            <h2 className="text-xl font-semibold text-gray-900">Dropbox</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isLoggedIn ? (
            // Login Screen
            <div className="text-center space-y-6">
              <div>
                <svg className="w-16 h-16 text-blue-600 mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 2L12 6L6 10L0 6L6 2ZM18 2L24 6L18 10L12 6L18 2ZM0 14L6 10L12 14L6 18L0 14ZM18 10L24 14L18 18L12 14L18 10ZM6 21L12 17L18 21L12 24L6 21Z"/>
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect to Dropbox</h3>
                <p className="text-gray-600">Upload your formula files directly to your Dropbox account</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    Files will be uploaded to: <strong>/Apps/Formulas/</strong>
                  </p>
                </div>
                
                <Button 
                  onClick={handleLogin}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                >
                  Connect to Dropbox
                </Button>
              </div>
            </div>
          ) : (
            // Upload Screen
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Formula Files</h3>
                <p className="text-gray-600">Select files to upload to your Formulas folder</p>
              </div>

              {/* File Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <label className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-500 font-medium">Choose files</span>
                  <span className="text-gray-600"> or drag and drop</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Supports PDF, DOC, XLS, TXT, CSV files
                </p>
              </div>

              {/* Selected Files */}
              {files.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Selected Files ({files.length})</h4>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <File className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Status */}
              {uploadStatus !== 'idle' && (
                <div className="p-4 rounded-lg border">
                  {uploadStatus === 'uploading' && (
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-blue-600">Uploading files...</span>
                    </div>
                  )}
                  {uploadStatus === 'success' && (
                    <div className="flex items-center space-x-3 text-green-600">
                      <Check className="w-5 h-5" />
                      <span>Files uploaded successfully!</span>
                    </div>
                  )}
                  {uploadStatus === 'error' && (
                    <div className="flex items-center space-x-3 text-red-600">
                      <AlertCircle className="w-5 h-5" />
                      <span>Upload failed. Please try again.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Upload Button */}
              <div className="flex space-x-3">
                <Button
                  onClick={onClose}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={files.length === 0 || uploadStatus === 'uploading'}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
                >
                  {uploadStatus === 'uploading' ? 'Uploading...' : `Upload ${files.length} file${files.length !== 1 ? 's' : ''}`}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DropboxUploadModal; 