"use client";
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { X, Eye, Trash2, Copy, FileIcon, ImageIcon, VideoIcon, CheckCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { 
  RenderEmptyState, 
  RenderErrorState, 
  RenderUploadingState, 
  RenderSuccessState 
} from "./RenderState";

interface FileItem {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  errorMessage?: string;
  previewUrl: string;
  uploadedUrl?: string;
  cid?: string;
  fileType: "image" | "video" | "document";
}

interface UploaderProps {
  maxFiles?: number;
  maxSize?: number;
  acceptedFileTypes?: {
    [key: string]: string[];
  };
  onUploadComplete?: (files: FileItem[]) => void;
  onFileRemove?: (fileId: string) => void;
  className?: string;
  value?: string[];
  onChange?: (urls: string[]) => void;
  name?: string;
  disabled?: boolean;
  uploadEndpoint?: string;
}

export default function Uploader({
  maxFiles = 5,
  maxSize = 5,
  acceptedFileTypes = {
    "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    "video/*": [".mp4", ".webm", ".mov"],
    "application/pdf": [".pdf"],
  },
  onUploadComplete,
  onFileRemove,
  className,
  value = [],
  onChange,
  name,
  disabled = false,
  uploadEndpoint = "/api/upload"
}: UploaderProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "completed" | "error">("idle");
  const [globalProgress, setGlobalProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize from form value
  useEffect(() => {
    if (value.length > 0 && files.length === 0) {
      const existingFiles: FileItem[] = value.map((url, index) => ({
        id: `existing-${index}`,
        file: new File([], `uploaded-file-${index}`, { type: 'application/octet-stream' }),
        progress: 100,
        status: "completed" as const,
        previewUrl: url,
        uploadedUrl: url,
        fileType: url.toLowerCase().includes('image') || url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' as const : 'document' as const
      }));
      setFiles(existingFiles);
    }
  }, [value, files.length]);

  // Generate unique file ID
  const generateFileId = () => `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Determine file type
  const getFileType = (file: File): FileItem["fileType"] => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    return "document";
  };

  // Get appropriate icon for file type
  const getFileIcon = (fileType: FileItem["fileType"]) => {
    switch (fileType) {
      case "image": return ImageIcon;
      case "video": return VideoIcon;
      default: return FileIcon;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Update form value when files change
  const updateFormValue = useCallback((updatedFiles: FileItem[]) => {
    const completedUrls = updatedFiles
      .filter(f => f.status === "completed" && f.uploadedUrl)
      .map(f => f.uploadedUrl!);
    onChange?.(completedUrls);
  }, [onChange]);

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback((acceptedFiles: File[]) => {
      if (files.length + acceptedFiles.length > maxFiles) {
        toast.error(`Cannot add more than ${maxFiles} files. Current: ${files.length}, Trying to add: ${acceptedFiles.length}`);
        return;
      }

      const newFiles: FileItem[] = acceptedFiles.map(file => ({
        id: generateFileId(),
        file,
        progress: 0,
        status: "pending" as const,
        previewUrl: URL.createObjectURL(file),
        fileType: getFileType(file),
      }));

      setFiles(prev => [...prev, ...newFiles]);
      toast.success(`${acceptedFiles.length} file(s) added - Click upload to complete`);
      
      // Auto-upload if only one file and maxFiles is 1 (like thumbnail upload)
      if (maxFiles === 1 && acceptedFiles.length === 1) {
        setTimeout(() => handleUpload(), 500);
      }
    }, [files.length, maxFiles]),
    
    multiple: maxFiles > 1,
    maxFiles: maxFiles - files.length,
    maxSize: maxSize * 1024 * 1024,
    accept: acceptedFileTypes,
    disabled: disabled || isUploading,
    
    onDropRejected: (fileRejections) => {
      fileRejections.forEach((rejection) => {
        rejection.errors.forEach((error) => {
          switch (error.code) {
            case "file-too-large":
              toast.error(`File "${rejection.file.name}" is too large. Max size is ${maxSize}MB.`);
              break;
            case "file-invalid-type":
              toast.error(`File "${rejection.file.name}" has invalid type. Check supported formats.`);
              break;
            case "too-many-files":
              toast.error(`Too many files. Maximum ${maxFiles} files allowed.`);
              break;
            default:
              toast.error(`Error with "${rejection.file.name}": ${error.message}`);
          }
        });
      });
    },
  });

  // Handle file removal
  const handleRemove = useCallback((fileId: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove && fileToRemove.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      
      const newFiles = prev.filter(f => f.id !== fileId);
      updateFormValue(newFiles);
      onFileRemove?.(fileId);
      return newFiles;
    });
    toast.info("File removed");
  }, [onFileRemove, updateFormValue]);

  // Simulate realistic upload progress
  const simulateUploadProgress = (fileId: string): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0;
      const intervals = [
        { max: 30, speed: 150, increment: [2, 8] },
        { max: 60, speed: 200, increment: [1, 4] },
        { max: 90, speed: 300, increment: [0.5, 2] },
        { max: 100, speed: 100, increment: [2, 10] }
      ];
      
      let currentPhase = 0;
      
      const updateProgress = () => {
        if (currentPhase >= intervals.length) {
          resolve();
          return;
        }
        
        const phase = intervals[currentPhase];
        const increment = Math.random() * (phase.increment[1] - phase.increment[0]) + phase.increment[0];
        progress = Math.min(progress + increment, phase.max);
        
        setFiles(prev => prev.map(file => {
          if (file.id === fileId) {
            return { ...file, progress };
          }
          return file;
        }));

        if (progress >= phase.max) {
          currentPhase++;
        }
        
        if (progress >= 100) {
          resolve();
        } else {
          setTimeout(updateProgress, phase.speed + Math.random() * 100);
        }
      };
      
      updateProgress();
    });
  };

  // Handle upload to server
  const uploadFileToServer = async (fileItem: FileItem): Promise<{ url: string; cid?: string }> => {
    const formData = new FormData();
    formData.append("file", fileItem.file);
    formData.append("fileName", fileItem.file.name);
    formData.append("fileType", fileItem.file.type);
    
    if (name) {
      formData.append("fieldName", name);
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(uploadEndpoint, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      
      const url = data.url || data.secure_url || data.location || data.fileUrl;
      
      if (!url) {
        throw new Error("Server did not return a valid file URL");
      }
      
      return {
        url,
        cid: data.cid || data.hash || data.ipfsHash
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error("Upload timed out. Please try again.");
        }
        throw error;
      }
      throw new Error("Upload failed due to network error");
    }
  };

  // Main upload handler
  const handleUpload = async () => {
    const pendingFiles = files.filter(f => f.status === "pending");
    
    if (pendingFiles.length === 0) {
      toast.error("No files to upload!");
      return;
    }

    setIsUploading(true);
    setUploadStatus("uploading");
    setGlobalProgress(0);

    let completedCount = 0;
    const totalFiles = pendingFiles.length;
    const updatedFiles = [...files];

    try {
      // Set all pending files to uploading
      setFiles(prev => prev.map(file => 
        file.status === "pending" 
          ? { ...file, status: "uploading" as const } 
          : file
      ));

      // Upload files
      for (let i = 0; i < pendingFiles.length; i++) {
        const fileItem = pendingFiles[i];
        
        try {
          const [, uploadResult] = await Promise.all([
            simulateUploadProgress(fileItem.id),
            uploadFileToServer(fileItem)
          ]);
          
          // Update file with upload result
          setFiles(prev => {
            const newFiles = prev.map(file => {
              if (file.id === fileItem.id) {
                return {
                  ...file,
                  status: "completed" as const,
                  progress: 100,
                  uploadedUrl: uploadResult.url,
                  cid: uploadResult.cid
                };
              }
              return file;
            });
            
            // Update form value immediately
            updateFormValue(newFiles);
            return newFiles;
          });

          completedCount++;
          setGlobalProgress((completedCount / totalFiles) * 100);
          
          toast.success(`${fileItem.file.name} uploaded successfully`);
        } catch (error) {
          setFiles(prev => prev.map(file => {
            if (file.id === fileItem.id) {
              return {
                ...file,
                status: "error" as const,
                errorMessage: error instanceof Error ? error.message : "Upload failed"
              };
            }
            return file;
          }));
          
          toast.error(`Failed to upload ${fileItem.file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      const successCount = files.filter(f => f.status === "completed").length;
      const errorCount = files.filter(f => f.status === "error").length;
      
      if (successCount > 0) {
        const completedFiles = files.filter(f => f.status === "completed");
        onUploadComplete?.(completedFiles);
        toast.success(`Upload completed! ${successCount} file(s) uploaded successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`);
      }
      
      setUploadStatus(errorCount === 0 ? "completed" : "error");
    } catch (error) {
      setUploadStatus("error");
      toast.error("Upload process failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Auto-upload functionality for single file uploads (like thumbnails)
  useEffect(() => {
    if (maxFiles === 1 && files.length === 1 && files[0].status === "pending") {
      const timer = setTimeout(() => {
        handleUpload();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [files, maxFiles]);

  // Retry failed uploads
  const handleRetryFailed = () => {
    setFiles(prev => prev.map(file => 
      file.status === "error" 
        ? { ...file, status: "pending" as const, progress: 0, errorMessage: undefined }
        : file
    ));
    setUploadStatus("idle");
  };

  // Reset uploader (remove all files)
  const handleReset = () => {
    files.forEach(file => {
      if (file.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(file.previewUrl);
      }
    });
    
    setFiles([]);
    setUploadStatus("idle");
    setGlobalProgress(0);
    onChange?.([]);
  };

  // Handle file preview
  const handlePreview = (file: FileItem) => {
    const urlToUse = file.uploadedUrl || file.previewUrl;
    
    if (file.fileType === "image") {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Preview: ${file.file.name}</title>
              <style>
                body { margin:0; padding:20px; background:#0f172a; display:flex; align-items:center; justify-content:center; min-height:100vh; font-family: system-ui; }
                img { max-width:100%; max-height:100vh; object-fit:contain; border-radius:8px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
                .info { position: absolute; top: 20px; left: 20px; color: white; background: rgba(0,0,0,0.7); padding: 10px; border-radius: 8px; }
              </style>
            </head>
            <body>
              <div class="info">${file.file.name.replace(/[<>&"]/g, '')}</div>
              <img src="${urlToUse}" alt="${file.file.name.replace(/["<>&]/g, '')}" />
            </body>
          </html>
        `);
      }
    } else if (file.uploadedUrl) {
      window.open(file.uploadedUrl, '_blank');
    } else {
      toast.info("Preview not available for this file type");
    }
  };

  const handleCopyUrl = async (file: FileItem) => {
    if (file.uploadedUrl) {
      try {
        await navigator.clipboard.writeText(file.uploadedUrl);
        toast.success("URL copied to clipboard!");
      } catch (error) {
        toast.error("Failed to copy URL");
      }
    }
  };

  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
  }, []);

  // Main render function
  const renderContent = () => {
    const hasFiles = files.length > 0;
    const hasCompletedFiles = files.some(f => f.status === "completed");
    const hasPendingFiles = files.some(f => f.status === "pending");
    const hasErrorFiles = files.some(f => f.status === "error");
    const hasUploadingFiles = files.some(f => f.status === "uploading");

    // Show success state for single file uploads (thumbnails)
    if (maxFiles === 1 && hasCompletedFiles && !hasPendingFiles && !hasUploadingFiles) {
      const completedFile = files.find(f => f.status === "completed");
      if (completedFile) {
        return (
          <div className="text-center py-6">
            <div className="mb-4">
              {completedFile.fileType === "image" ? (
                <Image
                  src={completedFile.uploadedUrl || completedFile.previewUrl}
                  alt={completedFile.file.name}
                  width={128}
                  height={128}
                  unoptimized
                  className="w-32 h-32 mx-auto rounded-lg object-cover border-2 border-emerald-400 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 mx-auto rounded-lg bg-slate-600/50 flex items-center justify-center border-2 border-emerald-400">
                  <FileIcon className="w-16 h-16 text-emerald-400" />
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-emerald-400">Upload Successful!</h3>
            </div>
            
            <p className="text-sm text-slate-300 mb-4 truncate">
              {completedFile.file.name}
            </p>
            
            <div className="flex gap-2 justify-center">
              <Button
                size="sm"
                variant="glass"
                onClick={() => handlePreview(completedFile)}
                className="border-cyan-400/50 text-cyan-300 hover:text-cyan-200"
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
              
              <Button
                size="sm"
                variant="glass"
                onClick={handleReset}
                className="border-red-400/50 text-red-300 hover:text-red-200"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Replace
              </Button>
            </div>
          </div>
        );
      }
    }

    return (
      <div className="space-y-6">
        {/* Empty state or drag area */}
        {!hasFiles && (
          <RenderEmptyState 
            isDragActive={isDragActive} 
            acceptedFileTypes={Object.keys(acceptedFileTypes)} 
            maxSize={maxSize} 
          />
        )}

        {/* File list */}
        {hasFiles && (
          <div className="w-full space-y-4">
            {/* Show upload progress for single files */}
            {maxFiles === 1 && hasUploadingFiles && (
              <RenderUploadingState 
                progress={files[0]?.progress || 0}
                fileName={files[0]?.file.name || ""}
              />
            )}
            
            {/* Regular file list for multiple files */}
            {maxFiles > 1 && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">
                    Files ({files.length}/{maxFiles})
                  </h3>
                  <div className="flex gap-2">
                    {hasErrorFiles && (
                      <Button
                        size="sm"
                        variant="glass"
                        onClick={handleRetryFailed}
                        className="text-xs border-orange-400/50 hover:border-orange-400 text-orange-300 hover:text-orange-200"
                        disabled={isUploading}
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Retry Failed
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="glass"
                      onClick={handleReset}
                      className="text-xs border-red-400/50 hover:border-red-400 text-red-300 hover:text-red-200"
                      disabled={isUploading}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>

                {/* Global progress bar */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-300">
                      <span>Overall Progress</span>
                      <span className="text-emerald-400 font-medium">{Math.round(globalProgress)}%</span>
                    </div>
                    <div className="w-full bg-slate-600/50 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full transition-all duration-500 ease-out shadow-lg shadow-emerald-500/30"
                        style={{ width: `${globalProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                  {files.map((fileItem) => {
                    const FileIconComponent = getFileIcon(fileItem.fileType);
                    const isCompleted = fileItem.status === "completed";
                    const isError = fileItem.status === "error";
                    const isUploadingFile = fileItem.status === "uploading";
                    const isPending = fileItem.status === "pending";

                    return (
                      <div
                        key={fileItem.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border backdrop-blur-sm transition-all duration-300",
                          isCompleted && "border-emerald-500/50 bg-emerald-900/20 shadow-lg shadow-emerald-500/10",
                          isError && "border-red-500/50 bg-red-900/20 shadow-lg shadow-red-500/10",
                          isUploadingFile && "border-cyan-500/50 bg-cyan-900/20 shadow-lg shadow-cyan-500/10",
                          isPending && "border-slate-600/50 bg-slate-700/30 hover:bg-slate-600/30 hover:border-slate-500/70"
                        )}
                      >
                        {/* File preview/icon */}
                        <div className="flex-shrink-0 relative">
                          {fileItem.fileType === "image" ? (
                            <Image
                              src={fileItem.uploadedUrl || fileItem.previewUrl}
                              alt={fileItem.file.name}
                              width={48}
                              height={48}
                              unoptimized
                              className="w-12 h-12 rounded-lg object-cover border border-slate-500 shadow-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-600/50 flex items-center justify-center border border-slate-500">
                              <FileIconComponent className="w-6 h-6 text-slate-300" />
                            </div>
                          )}
                          
                          {/* Status indicator */}
                          {isCompleted && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                          )}
                          
                          {isError && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                              <X className="w-3 h-3 text-white" />
                            </div>
                          )}
                          
                          {isUploadingFile && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            </div>
                          )}
                        </div>

                        {/* File info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {fileItem.file.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span>{formatFileSize(fileItem.file.size)}</span>
                            {isCompleted && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-400 font-medium">Uploaded</span>
                              </>
                            )}
                            {isError && (
                              <>
                                <span>•</span>
                                <span className="text-red-400 font-medium">Failed</span>
                              </>
                            )}
                            {isUploadingFile && (
                              <>
                                <span>•</span>
                                <span className="text-cyan-400 font-medium">Uploading</span>
                              </>
                            )}
                          </div>
                          
                          {/* Error message */}
                          {isError && fileItem.errorMessage && (
                            <p className="text-xs text-red-400 mt-1 truncate">
                              {fileItem.errorMessage}
                            </p>
                          )}
                          
                          {/* Progress bar for uploading files */}
                          {isUploadingFile && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-slate-300 mb-1">
                                <span>Uploading...</span>
                                <span className="text-cyan-400 font-medium">{Math.round(fileItem.progress)}%</span>
                              </div>
                              <div className="w-full bg-slate-600/50 rounded-full h-1.5">
                                <div 
                                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all duration-300 shadow-lg shadow-cyan-500/30"
                                  style={{ width: `${fileItem.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-1">
                          {fileItem.fileType === "image" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreview(fileItem);
                              }}
                              disabled={isUploading}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {isCompleted && fileItem.uploadedUrl && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyUrl(fileItem);
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemove(fileItem.id);
                            }}
                            disabled={isUploading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Upload button */}
                {hasPendingFiles && (
                  <Button
                    onClick={handleUpload}
                    variant="gradient"
                    size="lg"
                    className="w-full shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Uploading {files.filter(f => f.status === "uploading").length} of {files.filter(f => f.status === "pending" || f.status === "uploading").length} files...
                      </>
                    ) : (
                      `Upload ${files.filter(f => f.status === "pending").length} File${files.filter(f => f.status === "pending").length > 1 ? 's' : ''}`
                    )}
                  </Button>
                )}

                {/* Add more files section */}
                {files.length < maxFiles && !isUploading && (
                  <div className="pt-4 border-t border-slate-600/50">
                    <div className="text-center py-4">
                      <Button
                        variant="glass"
                        size="sm"
                        className="border-dashed border-2 border-slate-600/50 hover:border-emerald-400/70 text-slate-300 hover:text-emerald-300"
                        onClick={() => {
                          const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                          input?.click();
                        }}
                      >
                        Add More Files ({maxFiles - files.length} remaining)
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card
      {...getRootProps()}
      className={cn(
        "relative border-2 border-dashed transition-all duration-300 cursor-pointer group bg-slate-800/30 backdrop-blur-sm",
        isDragActive
          ? "border-emerald-400 bg-gradient-to-br from-emerald-900/30 to-cyan-900/30 border-solid shadow-lg shadow-emerald-500/25 scale-[1.02]"
          : "border-slate-600/50 hover:border-emerald-400/70 hover:bg-gradient-to-br hover:from-emerald-900/20 hover:to-cyan-900/20 hover:shadow-lg hover:shadow-emerald-500/10",
        (isUploading || disabled) && "cursor-not-allowed opacity-75",
        className
      )}
    >
      <CardContent className="p-8 text-white">
        <input {...getInputProps()} />
        {renderContent()}
      </CardContent>
    </Card>
  );
}