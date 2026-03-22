import { useState, useRef, useEffect } from 'react';
import { useNoteStore } from '../../store/useNoteStore';
import { supabase } from '../../supabase/config';
import { useAuth } from '../../hooks/useAuth';
import { Upload, Image as ImageIcon, Loader2, AlertCircle, Trash2, Maximize2 } from 'lucide-react';

export default function ImageWidget({ widget }) {
  const { actions, noteId } = useNoteStore();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const fileInputRef = useRef(null);

  // Sync previewUrl with storageUrl to avoid flickering
  // Only clear preview when the new storageUrl has successfully loaded
  useEffect(() => {
    if (widget.content.storageUrl && imageLoaded) {
      setPreviewUrl(null);
    }
  }, [widget.content.storageUrl, imageLoaded]);

  const fitToImage = () => {
    const img = new Image();
    img.src = widget.content.storageUrl || previewUrl;
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      let targetWidth = Math.min(Math.max(img.width, 200), 800);
      let targetHeight = targetWidth / aspectRatio;

      if (targetHeight > 800) {
        targetHeight = 800;
        targetWidth = targetHeight * aspectRatio;
      }
      
      actions.resizeWidget(widget.id, targetWidth, targetHeight);
    };
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setLoadError(false);
    setImageLoaded(false);

    // Step 1: Preview and Resize
    const blobUrl = URL.createObjectURL(file);
    setPreviewUrl(blobUrl);

    // Get image dimensions and resize widget
    const img = new Image();
    img.src = blobUrl;
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      
      // Determine target width (min 200, max 600, or natural if in between)
      let targetWidth = Math.min(Math.max(img.width, 200), 600);
      let targetHeight = targetWidth / aspectRatio;

      // If height is too tall, cap it and adjust width
      if (targetHeight > 600) {
        targetHeight = 600;
        targetWidth = targetHeight * aspectRatio;
      }
      
      // Update widget size to match aspect ratio
      actions.resizeWidget(widget.id, targetWidth, targetHeight);
    };

    try {
      // Step 2: Upload to Supabase
      const imageId = crypto.randomUUID();
      const ext = file.name.split('.').pop();
      const filePath = `${user.uid}/${noteId}/${imageId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('nerddata')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Step 3: Get URL
      const { data } = supabase.storage
        .from('nerddata')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      // Step 4: Update store
      actions.updateContent(widget.id, { storageUrl: publicUrl });
    } catch (err) {
      console.error('Upload failed:', err);
      if (err.message?.includes('row-level security policy')) {
        setError('Permission denied. Check Supabase RLS.');
      } else {
        setError('Upload failed. Try again.');
      }
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (e) => {
    e.stopPropagation();
    actions.updateContent(widget.id, { storageUrl: '' });
    setPreviewUrl(null);
    setImageLoaded(false);
    setLoadError(false);
  };

  const displayUrl = widget.content.storageUrl || previewUrl;

  if (!displayUrl) {
    return (
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="w-full h-full border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all p-4"
      >
        <Upload className="text-text-muted" size={24} />
        <span className="text-xs font-medium text-text-muted">Click to upload image</span>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          className="hidden" 
          accept="image/*" 
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full group bg-surface/50 rounded-lg overflow-hidden">
      {(!imageLoaded || loadError) && displayUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface">
          {loadError ? (
            <div className="flex flex-col items-center gap-4 p-6 text-center bg-red-500/10 h-full justify-center">
              <AlertCircle className="text-red-500" size={40} />
              <div className="space-y-2">
                <p className="text-sm font-bold text-white uppercase tracking-widest">Action Required</p>
                <p className="text-[11px] text-text-muted leading-relaxed max-w-[240px]">
                  Your Supabase Storage bucket is <b>Private</b>. I cannot fix this from the code. 
                  Please click the button below to copy the SQL fix, then paste it into your <b>Supabase SQL Editor</b>.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full max-w-[200px]">
                <button 
                  onClick={() => {
                    const sql = `-- RUN THIS IN SUPABASE SQL EDITOR\nUPDATE storage.buckets SET public = true WHERE id = 'nerddata';\nCREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'nerddata');`;
                    navigator.clipboard.writeText(sql);
                    alert("SQL Fix copied! Now go to Supabase > SQL Editor and paste it.");
                  }}
                  className="w-full bg-primary text-white px-4 py-2.5 rounded-xl text-[11px] font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                >
                  1. Copy SQL Fix
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-surface border border-border px-4 py-2 rounded-xl text-[11px] font-bold hover:bg-border transition-all"
                >
                  2. Try Different Image
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-pulse flex flex-col items-center gap-2">
              <ImageIcon className="text-text-muted opacity-20" size={40} />
            </div>
          )}
        </div>
      )}
      
      <img 
        src={displayUrl} 
        alt="Widget" 
        onLoad={() => {
          setImageLoaded(true);
          setLoadError(false);
        }}
        onError={() => {
          console.error("Image failed to load:", displayUrl);
          setLoadError(true);
        }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded && !loadError ? 'opacity-100' : 'opacity-0'}`}
        referrerPolicy="no-referrer"
      />
      
      {uploading && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-10">
          <Loader2 className="animate-spin text-primary" size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white">Uploading</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-red-500/90 backdrop-blur-sm flex flex-col items-center justify-center gap-2 p-4 text-center z-20">
          <AlertCircle className="text-white" size={24} />
          <span className="text-[10px] font-bold text-white uppercase tracking-wider leading-tight">{error}</span>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 bg-white text-red-500 px-4 py-1.5 rounded-full text-[10px] font-bold hover:scale-105 transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {/* Overlay Controls */}
      <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0 z-30">
        <button 
          onClick={fitToImage}
          className="p-2 bg-background/90 backdrop-blur-md rounded-lg hover:text-primary shadow-xl border border-border/50"
          title="Fit to Image Dimensions"
        >
          <Maximize2 size={14} />
        </button>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-2 bg-background/90 backdrop-blur-md rounded-lg hover:text-primary shadow-xl border border-border/50"
          title="Change Image"
        >
          <ImageIcon size={14} />
        </button>
        <button 
          onClick={removeImage}
          className="p-2 bg-background/90 backdrop-blur-md rounded-lg hover:text-red-500 shadow-xl border border-border/50"
          title="Remove Image"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
        accept="image/*" 
      />
    </div>
  );
}
