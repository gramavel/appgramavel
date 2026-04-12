import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadCropProps {
  value: string | null;
  onChange: (url: string) => void;
  onRemove?: () => void;
  aspect: number;
  bucket: string;
  storagePath: string;
  label: string;
  hint?: string;
  renderTrigger?: () => React.ReactNode;
}

function getCroppedBlob(image: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    image,
    crop.x * scaleX, crop.y * scaleY,
    crop.width * scaleX, crop.height * scaleY,
    0, 0,
    canvas.width, canvas.height
  );
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.9);
  });
}

export default function ImageUploadCrop({
  value, onChange, onRemove, aspect, bucket, storagePath, label, hint, renderTrigger,
}: ImageUploadCropProps) {
  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<File | null>(null);

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    fileRef.current = file;
    const reader = new FileReader();
    reader.onload = () => {
      setImgSrc(reader.result as string);
      setDialogOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const cropWidth = Math.min(width, height * aspect);
    const cropHeight = cropWidth / aspect;
    setCrop({
      unit: "px",
      x: (width - cropWidth) / 2,
      y: (height - cropHeight) / 2,
      width: cropWidth,
      height: cropHeight,
    });
  }

  const handleConfirm = useCallback(async () => {
    if (!imgRef.current || !completedCrop || !fileRef.current) return;
    setUploading(true);
    try {
      const blob = await getCroppedBlob(imgRef.current, completedCrop);
      const ext = fileRef.current.name.split(".").pop() || "jpg";
      const path = `${storagePath}${Date.now()}_${fileRef.current.name.replace(/\.[^.]+$/, "")}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, blob, { contentType: "image/jpeg", upsert: true });

        if (uploadError) {
        toast.error("Ops! Tivemos um problema ao enviar a imagem.");
        setUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(publicUrl);

      // Save to media_uploads
      await supabase.from("media_uploads").insert({
        storage_path: path,
        public_url: publicUrl,
        bucket,
        entity_type: aspect > 1 ? "establishment_banner" : "establishment_photo",
        original_name: fileRef.current.name,
        size_bytes: blob.size,
      });

      setDialogOpen(false);
      toast.success("Imagem enviada com sucesso!");
    } catch {
      toast.error("Ops! Tivemos um problema ao processar a imagem.");
    }
    setUploading(false);
  }, [completedCrop, bucket, storagePath, aspect, onChange]);

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onSelectFile} />

      {renderTrigger ? (
        <div onClick={() => inputRef.current?.click()} className="cursor-pointer">
          {renderTrigger()}
        </div>
      ) : (
        <div className="space-y-2">
          <span className="text-sm font-medium">{label}</span>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}

          {value ? (
            <div className="relative group" style={{ aspectRatio: aspect }}>
              <img src={value} alt="" className="w-full h-full object-cover rounded-xl" />
              {onRemove && (
                <button
                  onClick={onRemove}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => inputRef.current?.click()}
              >
                Trocar
              </Button>
            </div>
          ) : (
            <button
              onClick={() => inputRef.current?.click()}
              className="w-full border-2 border-dashed border-muted-foreground/30 rounded-xl flex flex-col items-center justify-center gap-2 py-8 hover:border-primary/50 transition-colors"
              style={{ aspectRatio: aspect }}
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Enviar imagem</span>
            </button>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Recortar imagem</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center max-h-[60vh] overflow-auto">
            {imgSrc && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
              >
                <img ref={imgRef} src={imgSrc} alt="" onLoad={onImageLoad} className="max-h-[55vh]" />
              </ReactCrop>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleConfirm} disabled={uploading}>
              {uploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando...</> : "Confirmar e enviar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
