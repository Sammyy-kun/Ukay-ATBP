"use client";

import { useRef, useState } from "react";
import { ChevronLeft, Shirt, Undo2, Image as ImageIcon } from "lucide-react";

const SHOTS = ["Front", "Back", "Tag / label", "Flaws"] as const;
type ShotLabel = (typeof SHOTS)[number];

interface CameraCaptureProps {
  onBack?: () => void;
  onComplete: (photos: string[]) => void;
}

export function CameraCapture({ onBack, onComplete }: CameraCaptureProps) {
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null]);
  const [activeIndex, setActiveIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeLabel: ShotLabel = SHOTS[activeIndex];
  const allDone = photos.every((p) => p !== null);

  function handleShutterClick() {
    fileInputRef.current?.click();
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotos((prev) => {
      const next = [...prev];
      next[activeIndex] = url;
      return next;
    });
    // advance to the next unfilled shot, if any
    const nextIndex = photos.findIndex((p, i) => p === null && i !== activeIndex);
    if (nextIndex !== -1) setActiveIndex(nextIndex);
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
    <div className="mx-auto w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      {/* header */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={onBack}
          aria-label="Back"
          className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-medium text-neutral-900">
          Shot {activeIndex + 1} of {SHOTS.length} · {activeLabel}
        </span>
        <div className="w-6" />
      </div>

      {/* viewfinder */}
      <div className="relative mb-4 flex aspect-[3/4] items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
        <div className="absolute inset-6 rounded-lg border border-dashed border-neutral-300" />
        {photos[activeIndex] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photos[activeIndex] as string}
            alt={`${activeLabel} photo preview`}
            className="h-full w-full object-cover"
          />
        ) : (
          <Shirt size={40} className="text-neutral-300" aria-hidden />
        )}
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-3 py-1 text-[11px] text-neutral-600 shadow-sm">
          Fill the frame, avoid glare
        </span>
      </div>

      {/* shot checklist */}
      <div className="mb-4 flex gap-1.5 overflow-x-auto">
        {SHOTS.map((label, i) => {
          const done = photos[i] !== null;
          const active = i === activeIndex;
          return (
            <button
              key={label}
              onClick={() => setActiveIndex(i)}
              className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1.5 text-[11px] transition-colors ${
                active
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : done
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-neutral-200 text-neutral-500"
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
      <div className="mb-4 flex items-center justify-center gap-8">
        <button aria-label="Import from gallery" className="text-neutral-400 hover:text-neutral-600">
          <ImageIcon size={20} />
        </button>
        <button
          onClick={handleShutterClick}
          aria-label="Take photo"
          className="flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-neutral-900"
        >
          <span className="h-11 w-11 rounded-full bg-neutral-900" />
        </button>
        <button
          onClick={handleUndo}
          aria-label="Undo last photo"
          className="text-neutral-400 hover:text-neutral-600"
        >
          <Undo2 size={20} />
        </button>
      </div>

      {/* hidden native camera input — capture="environment" opens the rear camera on mobile */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelected}
        className="hidden"
      />

      {/* thumbnail strip */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-0.5">
        {photos.map((p, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`h-11 w-11 flex-none overflow-hidden rounded-lg border ${
              p ? "border-neutral-300" : "border-dashed border-neutral-200"
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
        disabled={!allDone}
        onClick={() => onComplete(photos.filter((p): p is string => p !== null))}
        className="w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-40"
      >
        Done, continue to tagging
      </button>
    </div>
  );
}
