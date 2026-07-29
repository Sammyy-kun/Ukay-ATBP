'use client';

import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, CheckCircle, RefreshCw, X, Sparkles } from 'lucide-react';

interface GuidedCameraCaptureProps {
  onPhotosCaptured: (photos: string[]) => void;
  onCancel?: () => void;
}

const CAPTURE_STEPS = [
  { id: 'front', label: '1. Front View', hint: 'Frame full garment centered' },
  { id: 'back', label: '2. Back View', hint: 'Turn garment around' },
  { id: 'tag', label: '3. Brand/Tag Label', hint: 'Close-up of neck tag or care label' },
  { id: 'flaws', label: '4. Flaws/Details', hint: 'Close-up of seams, buttons, or flaws' },
];

const SAMPLE_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop&q=80',
];

export const GuidedCameraCapture: React.FC<GuidedCameraCaptureProps> = ({
  onPhotosCaptured,
  onCancel
}) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentStep = CAPTURE_STEPS[currentStepIndex] || CAPTURE_STEPS[CAPTURE_STEPS.length - 1];

  const handleCapturePhoto = () => {
    // If we have camera API or fallback, trigger file picker or sample image simulation
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newPhotoUrl = event.target.result as string;
          addPhoto(newPhotoUrl);
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const addPhoto = (photoUrl: string) => {
    const updated = [...photos, photoUrl];
    setPhotos(updated);

    if (currentStepIndex < CAPTURE_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleSimulateFastCapture = () => {
    // Quick demo shot generation for 60-sec listing test
    const sampleImg = SAMPLE_FALLBACK_IMAGES[currentStepIndex % SAMPLE_FALLBACK_IMAGES.length];
    addPhoto(sampleImg);
  };

  const handleRemovePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    if (index <= currentStepIndex && currentStepIndex > 0) {
      setCurrentStepIndex(updated.length);
    }
  };

  const handleFinish = () => {
    if (photos.length > 0) {
      onPhotosCaptured(photos);
    }
  };

  const isComplete = photos.length >= 1;

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Hidden File Input */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        ref={fileInputRef} 
        onChange={handleFileChange}
        className="hidden" 
      />

      {/* Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
        <div>
          <span className="text-xs font-semibold tracking-wider text-orange-400 uppercase">Guided Multi-Shot</span>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Camera className="w-5 h-5 text-orange-500" />
            Shot {Math.min(currentStepIndex + 1, CAPTURE_STEPS.length)} of {CAPTURE_STEPS.length}
          </h2>
        </div>
        {onCancel && (
          <button 
            onClick={onCancel} 
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Viewfinder with Frame Overlay */}
      <div className="relative flex-1 bg-black min-h-[300px] flex items-center justify-center overflow-hidden">
        {/* Frame Overlay */}
        <div className="absolute inset-6 border-2 border-dashed border-orange-500/70 rounded-2xl pointer-events-none flex flex-col justify-between p-4 bg-orange-500/5">
          <div className="flex justify-between items-start">
            <span className="bg-slate-900/90 text-orange-400 text-xs px-3 py-1 rounded-full font-medium border border-orange-500/30 shadow">
              {currentStep.label}
            </span>
            <span className="text-[10px] text-slate-400 bg-black/60 px-2 py-0.5 rounded">
              Align garment
            </span>
          </div>

          <div className="text-center bg-slate-900/80 backdrop-blur text-slate-200 text-xs py-1.5 px-3 rounded-lg mx-auto border border-slate-700/50 max-w-[240px]">
            💡 {currentStep.hint}
          </div>
        </div>

        {/* Dynamic preview background */}
        {photos[currentStepIndex] ? (
          <img 
            src={photos[currentStepIndex]} 
            alt="Current capture" 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="text-center p-6 text-slate-500 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center animate-pulse">
              <Camera className="w-8 h-8 text-orange-500/70" />
            </div>
            <p className="text-sm font-medium text-slate-400">Position garment inside the dashed frame</p>
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      <div className="p-3 bg-slate-900 border-t border-slate-800">
        <div className="text-xs text-slate-400 mb-2 flex justify-between items-center">
          <span>Captured ({photos.length}/{CAPTURE_STEPS.length}):</span>
          <button 
            onClick={handleSimulateFastCapture} 
            className="text-[11px] text-orange-400 hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" /> Quick Demo Snap
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar min-h-[70px]">
          {CAPTURE_STEPS.map((step, idx) => {
            const photo = photos[idx];
            const isActive = idx === currentStepIndex;

            return (
              <div 
                key={step.id} 
                className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                  isActive ? 'border-orange-500 scale-105 shadow-md shadow-orange-500/20' : 'border-slate-700 bg-slate-800'
                }`}
              >
                {photo ? (
                  <>
                    <img src={photo} alt={step.label} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-0.5 right-0.5 bg-red-600/90 text-white rounded-full p-0.5 text-[9px]"
                      title="Remove"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-[10px] text-center p-1">
                    <span className="font-semibold">{idx + 1}</span>
                    <span className="truncate max-w-full text-[9px]">{step.id}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
        <button
          onClick={handleCapturePhoto}
          className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium flex items-center justify-center gap-2 transition border border-slate-700"
        >
          <ImageIcon className="w-4 h-4 text-slate-400" />
          Choose Photo
        </button>

        {/* Circular Shutter Button */}
        <button
          onClick={handleSimulateFastCapture}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 p-1 shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition flex items-center justify-center"
          title="Snap Photo"
        >
          <div className="w-full h-full rounded-full border-2 border-white/80 flex items-center justify-center bg-orange-600">
            <div className="w-10 h-10 rounded-full bg-white shadow-inner"></div>
          </div>
        </button>

        <button
          onClick={handleFinish}
          disabled={!isComplete}
          className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
            isComplete 
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30' 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Done ({photos.length})
        </button>
      </div>
    </div>
  );
};
