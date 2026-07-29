import { useState } from "react";
import { ChevronLeft, Maximize2, X, Shirt, Ruler } from "lucide-react";
import { ThriftItem } from "@/lib/types";

interface CustomerItemDetailProps {
  item: ThriftItem;
  onBack: () => void;
}

export function CustomerItemDetail({ item, onBack }: CustomerItemDetailProps) {
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const photos = item.photos.length > 0 ? item.photos : [];

  return (
    <div className="mx-auto w-full max-w-2xl bg-white p-4 sm:p-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
      >
        <ChevronLeft size={16} />
        Back to items
      </button>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Photos */}
        <div className="w-full md:w-1/2 space-y-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 flex items-center justify-center">
            {photos[selectedPhotoIdx] ? (
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="group relative h-full w-full outline-none"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photos[selectedPhotoIdx]}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
                  <Maximize2
                    className="text-white opacity-0 transition-opacity group-hover:opacity-100 drop-shadow-md"
                    size={32}
                  />
                </div>
              </button>
            ) : (
              <div className="flex flex-col items-center gap-2 text-neutral-400">
                <Shirt size={40} />
                <span className="text-xs">No photos available</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {photos.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedPhotoIdx(i)}
                  className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border-2 transition-all ${
                    i === selectedPhotoIdx
                      ? "border-neutral-900 ring-2 ring-neutral-900/20"
                      : "border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="w-full md:w-1/2 flex flex-col pt-2">
          <div className="mb-2 inline-flex self-start rounded-full border border-neutral-200 px-2.5 py-1 text-[11px] font-semibold text-neutral-600">
            {item.category}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-2">
            {item.title}
          </h1>
          <div className="text-2xl font-medium text-neutral-900 mb-6">
            ₱{item.price}
          </div>

          {/* Specs */}
          <div className="space-y-4 border-y border-neutral-100 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-xs text-neutral-500 mb-1">Size</span>
                <span className="font-semibold text-neutral-900">{item.size}</span>
              </div>
              <div>
                <span className="block text-xs text-neutral-500 mb-1">Condition</span>
                <span className="font-semibold text-neutral-900">{item.condition}</span>
              </div>
            </div>

            {(item.lengthInches || item.widthInches) && (
              <div>
                <span className="block text-xs text-neutral-500 mb-1 flex items-center gap-1">
                  <Ruler size={12} /> Measurements
                </span>
                <span className="text-sm text-neutral-900">
                  {item.lengthInches ? `Length: ${item.lengthInches}" ` : ""}
                  {item.lengthInches && item.widthInches ? " · " : ""}
                  {item.widthInches ? `Width (Bust): ${item.widthInches}"` : ""}
                </span>
              </div>
            )}
          </div>

          {/* Notes */}
          {item.notes && (
            <div className="mt-6">
              <span className="block text-xs font-semibold text-neutral-900 mb-2">Details & Flaws</span>
              <p className="text-sm text-neutral-600 whitespace-pre-wrap leading-relaxed">
                {item.notes}
              </p>
            </div>
          )}

          <div className="mt-8 rounded-xl bg-neutral-50 p-4 border border-neutral-200/60">
            <p className="text-xs text-neutral-500 text-center">
              Interested in this item? Contact the store directly to purchase.
            </p>
          </div>
        </div>
      </div>

      {/* Fullscreen Overlay */}
      {isFullscreen && photos[selectedPhotoIdx] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-3 text-white backdrop-blur hover:bg-white/20 transition-colors"
          >
            <X size={24} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[selectedPhotoIdx]}
            alt="Fullscreen preview"
            className="max-h-[90vh] max-w-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
