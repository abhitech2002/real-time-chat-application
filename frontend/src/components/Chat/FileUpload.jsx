import { useState, useRef } from 'react';
import { uploadAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import './Chat.css';

const FileUpload = ({ onFileUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Show upload toast with progress
    const uploadToast = toast.info('Uploading file...', { 
      autoClose: false,
      closeButton: false 
    });

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress (since we don't have real progress tracking)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await uploadAPI.uploadFile(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      toast.dismiss(uploadToast);
      toast.success('File uploaded successfully!');
      
      onFileUploaded({
        url: response.data.data.url,
        name: file.name,
        size: file.size,
        type: file.type.startsWith('image/') ? 'image' : 'file'
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast.dismiss(uploadToast);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        accept="image/*,.pdf,.doc,.docx,.txt"
        disabled={uploading}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="file-upload-btn"
        disabled={uploading}
        title={uploading ? `Uploading ${uploadProgress}%` : 'Upload file'}
      >
        {uploading ? (
          <span className="upload-progress">{uploadProgress}%</span>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        )}
      </button>
    </>
  );
};

export default FileUpload;