import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fileApi } from '@/lib/api';

interface FileUploadFieldProps {
  onChange: (files: { original_name: string; saved_name: string }[] | FileList) => void;
  value?: { original_name: string; saved_name: string }[] | FileList;
  placeholder?: string;
  isPreview?: boolean;
  className?: string;
  mode?: 'local' | 'server';
}

export function FileUploadField({ onChange, value = [], placeholder, isPreview = false, className = '', mode = 'server' }: FileUploadFieldProps) {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (mode === 'local') {
      const dataTransfer = new DataTransfer();
      acceptedFiles.forEach(file => dataTransfer.items.add(file));
      onChange(dataTransfer.files);
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      const result = await fileApi.upload(acceptedFiles);
      onChange(result.files.map(file => ({
        original_name: file.original_name,
        saved_name: file.saved_name
      })));
    } catch (err) {
      setError(t('common.uploadError'));
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  }, [onChange, t, mode]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isPreview || isUploading,
    multiple: true,
    onDragEnter: () => {},
    onDragLeave: () => {},
    onDragOver: () => {}
  });

  const files = Array.isArray(value) ? value : (value ? Array.from(value) : []);

  const handleDelete = async (file: any, index: number) => {
    try {
      if (mode === 'server') {
        await fileApi.delete(file.saved_name);
        const newFiles = [...value as { original_name: string; saved_name: string }[]];
        newFiles.splice(index, 1);
        onChange(newFiles);
      } else {
        const dt = new DataTransfer();
        Array.from(value as FileList).forEach((f, i) => {
          if (i !== index) dt.items.add(f);
        });
        onChange(dt.files);
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError(t('common.deleteError'));
    }
  };

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`
          flex flex-col items-center justify-center w-full h-32 px-4 transition 
          bg-background border-2 border-dashed rounded-md appearance-none 
          ${isDragActive ? 'border-primary' : 'border-muted-foreground/25'} 
          ${!isPreview && !isUploading ? 'hover:border-primary/50 cursor-pointer' : ''} 
          ${isPreview || isUploading ? 'opacity-50 cursor-not-allowed' : ''} 
          ${className}
        `}
      >
        <input {...getInputProps()} className="hidden" />
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {isUploading ? (
            <Loader2 className="w-8 h-8 mb-2 text-muted-foreground animate-spin" />
          ) : (
            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
          )}
          <p className="text-sm text-muted-foreground">
            {isUploading
              ? t('common.uploading')
              : isDragActive
              ? t('common.dropFilesHere')
              : placeholder || t('common.dragAndDrop')}
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {value.length > 0 && (
        <div className="flex flex-col gap-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
              <span className="text-sm truncate">{mode === 'server' ? (file as any).original_name : (file as File).name}</span>
              {!isPreview && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(file, index);
                  }}
                  className="p-1 hover:bg-background rounded-md"
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}