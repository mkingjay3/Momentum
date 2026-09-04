"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ZoomIn, Upload, FileText } from "lucide-react";
import {
  RowsPhotoAlbum,
  RenderImageProps,
  RenderImageContext,
} from "react-photo-album";
import "react-photo-album/rows.css";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

type GalleryItem = {
  src: string;
  width: number;
  height: number;
  alt?: string;
  file_type?: "image" | "document";
};

const supabase = createClient();
const DOCUMENT_CARD_DIMENSIONS = { width: 800, height: 1000 };

const NK_DISPLAY = { fontFamily: "Helvetica Now Display Medium, Helvetica, Arial, sans-serif" };
const NK_TEXT = { fontFamily: "Helvetica Now Text, Helvetica, Arial, sans-serif" };
const NK_MED = { fontFamily: "Helvetica Now Text Medium, Helvetica, Arial, sans-serif" };

function getFileType(file: File): "image" | "document" {
  return file.type.startsWith("image/") ? "image" : "document";
}

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => { URL.revokeObjectURL(objectUrl); resolve({ width: img.naturalWidth, height: img.naturalHeight }); };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Could not read image dimensions")); };
    img.src = objectUrl;
  });
}

function renderGalleryItem(
  { alt = "", title, sizes }: RenderImageProps,
  { photo, width, height }: RenderImageContext,
) {
  const item = photo as GalleryItem;

  if (item.file_type === "document") {
    return (
      <div
        style={{ width: "100%", aspectRatio: `${width} / ${height}`, backgroundColor: "#f0f7f4" }}
        className="flex flex-col items-center justify-center p-4"
      >
        <FileText className="w-16 h-16 mb-3" strokeWidth={1.5} style={{ color: "#3d7a62" }} />
        <div className="text-sm font-medium text-center line-clamp-2" style={{ color: "#1b4332", ...NK_MED }}>
          {item.alt ?? "Document"}
        </div>
        <div className="text-xs mt-1" style={{ color: "#3d7a62", ...NK_TEXT }}>Open document</div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", position: "relative", aspectRatio: `${width} / ${height}` }}>
      <Image fill src={item.src} alt={alt} title={title} sizes={sizes} style={{ objectFit: "cover" }} />
    </div>
  );
}

function PhotoWrapper({ children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className="group relative overflow-hidden cursor-pointer" style={{ borderRadius: 0 }}>
      {children}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-colors duration-200 group-hover:bg-black/20">
        <ZoomIn
          className="w-9 h-9 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow"
          strokeWidth={1.5}
        />
      </div>
    </div>
  );
}

async function fetchGalleryItems(user: User): Promise<GalleryItem[]> {
  const { data, error } = await supabase
    .from("gallery_images")
    .select("src, width, height, alt, file_type")
    .eq("uploaded_by", user.id)
    .order("created_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return ((data as GalleryItem[]) ?? []).map((item) => ({ ...item, file_type: item.file_type ?? "image" }));
}

export default function Gallery() {
  const router = useRouter();
  const [index, setIndex] = useState(-1);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageItems = items.filter((item) => item.file_type === "image");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      setUser(u);
      setAuthChecked(true);
      if (u) fetchGalleryItems(u).then(setItems);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchGalleryItems(u).then(setItems);
      else setItems([]);
    });
    return () => subscription.unsubscribe();
  }, []);

  function openItem(item: GalleryItem) {
    if (item.file_type === "document") { window.open(item.src, "_blank", "noopener,noreferrer"); return; }
    setIndex(imageItems.findIndex((image) => image.src === item.src));
  }

  function handleUploadClick() {
    if (!user) {
      router.push("/signin?redirect=/gallery");
      return;
    }
    fileInputRef.current?.click();
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const fileType = getFileType(file);
      const dimensions = fileType === "image" ? await getImageDimensions(file) : DOCUMENT_CARD_DIMENSIONS;
      const safeFileName = file.name.replace(/[^\w.-]/g, "_");
      const fileName = `${user.id}/${Date.now()}-${safeFileName}`;
      const { error: uploadError } = await supabase.storage
        .from("gallery").upload(fileName, file, { contentType: file.type, upsert: false });
      if (uploadError) { console.error(uploadError); return; }
      const { data: { publicUrl } } = supabase.storage.from("gallery").getPublicUrl(fileName);
      const { error: insertError } = await supabase.from("gallery_images").insert({
        src: publicUrl, width: dimensions.width, height: dimensions.height,
        uploaded_by: user.id, alt: file.name, file_type: fileType,
      });
      if (insertError) { console.error(insertError); return; }
      setItems(await fetchGalleryItems(user));
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="px-6 py-12 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <h1
          className="text-[32px] font-medium leading-[1.2]"
          style={{ color: "#1b4332", ...NK_DISPLAY }}
        >
          Gallery
        </h1>

        <button
          onClick={handleUploadClick}
          disabled={uploading}
          className="flex items-center gap-2 px-5 h-10 text-[14px] font-medium transition-opacity hover:opacity-75 disabled:opacity-40"
          style={{ backgroundColor: "#1b4332", color: "#ffffff", borderRadius: "9999px", border: "none", ...NK_MED }}
        >
          <Upload className="w-4 h-4" />
          {uploading ? "Uploading…" : "Upload"}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,application/pdf"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {authChecked && !user ? (
        <p className="text-center py-16 text-[14px]" style={{ color: "#3d7a62", ...NK_TEXT }}>
          Sign in to view and upload your personal gallery.
        </p>
      ) : items.length === 0 && authChecked ? (
        <p className="text-center py-16 text-[14px]" style={{ color: "#3d7a62", ...NK_TEXT }}>
          No photos yet. Upload your first one!
        </p>
      ) : (
        <div>
          <RowsPhotoAlbum
            photos={items}
            spacing={4}
            targetRowHeight={300}
            render={{
              image: renderGalleryItem,
              wrapper: (props) => <PhotoWrapper {...props} />,
            }}
            defaultContainerWidth={1200}
            sizes={{
              size: "calc(100vw - 48px)",
              sizes: [
                { viewport: "(min-width: 1280px)", size: "1232px" },
                { viewport: "(min-width: 768px)", size: "calc(100vw - 48px)" },
              ],
            }}
            onClick={({ index }) => openItem(items[index])}
          />
          <Lightbox
            slides={imageItems}
            open={index >= 0}
            index={index}
            close={() => setIndex(-1)}
            plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]}
          />
        </div>
      )}
    </div>
  );
}