import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Loader2 } from 'lucide-react'
import { uploadImage } from '../lib/supabase'

export default function ImageUpload({
  bucket = 'images',
  path,
  value,
  onChange,
  accept = { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
  label = 'Upload Image',
  className = '',
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const uploadPath = path || `${Date.now()}-${file.name.replace(/\s/g, '-')}`
      const url = await uploadImage(bucket, file, uploadPath)
      onChange(url)
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [bucket, path, onChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept, maxFiles: 1 })

  return (
    <div className={className}>
      {value ? (
        <div className="relative group">
          <img src={value} alt="Preview" className="w-full h-40 object-cover rounded border border-brand-gold/20" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
            <button
              type="button"
              onClick={() => onChange(null)}
              className="flex items-center gap-1.5 text-xs text-white bg-red-600/80 px-3 py-1.5 rounded hover:bg-red-600"
            >
              <X size={12} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-brand-gold bg-brand-gold/5'
              : 'border-brand-gold/30 hover:border-brand-gold/60 hover:bg-brand-gold/5'
          }`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-brand-gold">
              <Loader2 size={24} className="animate-spin" />
              <p className="text-xs">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-brand-white/40">
              <Upload size={24} />
              <p className="text-xs">{label}</p>
              <p className="text-[10px] text-brand-white/30">Drag & drop or click to browse</p>
            </div>
          )}
        </div>
      )}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}
