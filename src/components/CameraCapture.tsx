"use client";

import { useRef, useState } from "react";
import { ChevronLeft, Shirt, Undo2, Image as ImageIcon } from "lucide-react";

const SHOTS = ["Front", "Back", "Tag 1", "Tag 2", "Tag 3", "Flaws"] as const;
type ShotLabel = (typeof SHOTS)[number];

interface CameraCaptureProps {
  onBack?: () => void;
  onComplete: (photos: string[]) => void;
}

export function CameraCapture({ onBack, onComplete }: CameraCaptureProps) {
  const [photos, setPhotos] = useState<(string | null)[]>(Array(6).fill(null));
  const [activeIndex, setActiveIndex] = useState(0);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const activeLabel: ShotLabel = SHOTS[activeIndex];
  const hasAnyPhoto = photos.some((p) => p !== null);

  function handleCameraClick() {
    cameraInputRef.current?.click();
  }

  function handleGalleryClick() {
    galleryInputRef.current?.click();
  }

  function processFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          savePhoto(dataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Compress heavily for the database
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.6);
        savePhoto(compressedDataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  function savePhoto(dataUrl: string) {
    setPhotos((prev) => {
      const next = [...prev];
      next[activeIndex] = dataUrl;
      return next;
    });

    const nextIndex = photos.findIndex((p, i) => p === null && i !== activeIndex);
    if (nextIndex !== -1) setActiveIndex(nextIndex);
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
    e.target.value = "";
  }

  function handleUndo() {
    setPhotos((prev) => {
      const next = [...prev];
      next[activeIndex] = null;
      return next;
    });
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 shadow-sm">
      {/* header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onBack}
          aria-label="Back"
          className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-semibold text-neutral-900">
          Shot {activeIndex + 1} of {SHOTS.length} · {activeLabel}
        </span>
        <div className="w-8" />
      </div>

      {/* viewfinder */}
      <div className="relative mb-5 flex aspect-[3/4] max-h-[380px] sm:max-h-[420px] w-full items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 shadow-inner">
        <div className="absolute inset-6 rounded-xl border-2 border-dashed border-neutral-300 pointer-events-none" />
        {photos[activeIndex] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photos[activeIndex] as string}
            alt={`${activeLabel} photo preview`}
            className="h-full w-full object-cover"
          />
        ) : (
          <Shirt size={48} className="text-neutral-300" aria-hidden />
        )}
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 backdrop-blur-sm px-3.5 py-1 text-xs font-medium text-neutral-600 shadow-sm border border-neutral-200/50">
          Fill the frame, avoid glare
        </span>
      </div>

      {/* shot checklist */}
      <div className="mb-5 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {SHOTS.map((label, i) => {
          const done = photos[i] !== null;
          const active = i === activeIndex;
          return (
            <button
              key={label}
              onClick={() => setActiveIndex(i)}
              className={`flex flex-1 min-w-[75px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                active
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : done
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  done ? "bg-green-500" : active ? "bg-white" : "bg-neutral-300"
                }`}
              />
              {label}
            </button>
          );
        })}
      </div>

      {/* shutter row */}
      <div className="mb-5 flex items-center justify-center gap-8">
        <button
          onClick={handleGalleryClick}
          aria-label="Import from gallery"
          title="Import from gallery"
          className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
        >
          <ImageIcon size={22} />
        </button>
        <button
          onClick={handleCameraClick}
          aria-label="Take photo"
          title="Take photo"
          className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-neutral-900 transition-transform active:scale-95"
        >
          <span className="h-12 w-12 rounded-full bg-neutral-900" />
        </button>
        <button
          onClick={handleUndo}
          aria-label="Undo photo"
          title="Undo photo"
          className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
        >
          <Undo2 size={22} />
        </button>
      </div>

      {/* Hidden file inputs: Camera & Gallery */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelected}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelected}
        className="hidden"
      />

      {/* thumbnail strip */}
      <div className="mb-5 flex gap-2.5 overflow-x-auto pb-1">
        {photos.map((p, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`h-12 w-12 flex-none overflow-hidden rounded-xl border-2 transition-all ${
              i === activeIndex
                ? "border-neutral-900 ring-2 ring-neutral-900/20"
                : p
                ? "border-neutral-300"
                : "border-dashed border-neutral-200 bg-neutral-50"
            }`}
          >
            {p ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p} alt="" className="h-full w-full object-cover" />
            ) : null}
          </button>
        ))}
      </div>

      <button
        disabled={!hasAnyPhoto}
        onClick={() => onComplete(photos.filter((p): p is string => p !== null))}
        className="w-full rounded-xl bg-neutral-900 py-3 text-sm font-semibold text-white transition-opacity hover:bg-neutral-800 disabled:opacity-40"
      >
        Done, continue to item details
      </button>
    </div>
  );
}
