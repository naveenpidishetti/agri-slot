import React, { useState, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { ScannerResult } from '../../types';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  ArrowLeft,
  Image as ImageIcon,
  FolderOpen,
  HelpCircle
} from 'lucide-react';

export const ProduceScanner: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useLanguage();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>('Paddy');
  const [scanning, setScanning] = useState<boolean>(false);
  const [result, setResult] = useState<ScannerResult | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset sample crops for instant testing on laptop/mobile
  const sampleImages = [
    {
      name: 'Paddy Sample',
      crop: 'Paddy',
      icon: '🌾',
      url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Wheat Grain',
      crop: 'Wheat',
      icon: '🌾',
      url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Cotton Boll',
      crop: 'Cotton',
      icon: '☁️',
      url: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Yellow Maize',
      crop: 'Maize',
      icon: '🌽',
      url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80'
    }
  ];

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sample: typeof sampleImages[0]) => {
    setSelectedCrop(sample.crop);
    setImagePreview(sample.url);
    setResult(null);
  };

  const handleRunScan = async () => {
    if (!imagePreview) return;
    setScanning(true);

    try {
      const formData = new FormData();
      formData.append('cropType', selectedCrop);
      if (fileInputRef.current?.files?.[0]) {
        formData.append('image', fileInputRef.current.files[0]);
      } else if (cameraInputRef.current?.files?.[0]) {
        formData.append('image', cameraInputRef.current.files[0]);
      }

      const res = await api.analyzeProduce(formData);
      setTimeout(() => {
        setResult(res);
        setScanning(false);
      }, 1200);
    } catch (err) {
      console.error('Scan error', err);
      setScanning(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-24 text-emerald-100">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
          <Camera className="w-3.5 h-3.5 text-emerald-600" />
          <span>Produce Quality Radar</span>
        </span>
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black font-outfit text-slate-900">
          AI Produce Quality & Moisture Scanner
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          Upload or snap produce grain photos from your phone or laptop to check moisture and mandi acceptance grade.
        </p>
      </div>

      {/* Camera / Upload Box */}
      <div className="card-clean p-6 sm:p-7 border border-slate-200 space-y-5 bg-white shadow-sm rounded-3xl">
        
        {/* Crop Selector */}
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700">Select Crop Variety:</label>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
          >
            <option value="Paddy">🌾 Paddy (Dhan)</option>
            <option value="Wheat">🌾 Wheat (Gehun)</option>
            <option value="Cotton">☁️ Cotton (Kapas)</option>
            <option value="Maize">🌽 Maize (Makka)</option>
            <option value="Soybean">🌱 Soybean</option>
            <option value="Chilli">🌶️ Red Chilli</option>
            <option value="Turmeric">🟡 Turmeric</option>
            <option value="Mustard">🌼 Mustard (Sarson)</option>
          </select>
        </div>

        {/* Upload Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-4 px-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 hover:border-emerald-400 hover:bg-emerald-50 transition group cursor-pointer"
          >
            <Upload className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition" />
            <div className="text-left">
              <div className="text-xs font-bold text-slate-900">Upload from Device</div>
              <div className="text-[10px] text-slate-500">Laptop or phone gallery (JPG/PNG)</div>
            </div>
          </button>

          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-4 px-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 hover:border-emerald-400 hover:bg-emerald-50 transition group cursor-pointer"
          >
            <Camera className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition" />
            <div className="text-left">
              <div className="text-xs font-bold text-slate-900">Capture Live Photo</div>
              <div className="text-[10px] text-slate-500">Direct camera capture</div>
            </div>
          </button>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />

        {/* Drag Drop or Preview Area */}
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`relative w-full rounded-2xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center min-h-[160px] ${
            isDragOver 
              ? 'border-emerald-500 bg-emerald-50 scale-[0.99]' 
              : 'border-slate-300 bg-slate-50'
          }`}
        >
          {imagePreview ? (
            <>
              <img src={imagePreview} alt="Produce Sample" className="w-full h-full object-cover" />
              {scanning && (
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex flex-col items-center justify-center">
                  <div className="p-3.5 rounded-2xl bg-white shadow-xl border border-slate-200 text-slate-900 text-xs font-bold flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>Analyzing Grain Matrix & Moisture...</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center p-6 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs animate-float-gentle">
                <ImageIcon className="w-7 h-7" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-slate-800">Add Grain Photo (Phone or Laptop)</div>
                <div className="text-xs text-slate-500 mt-1">Take a live photo, drag & drop, or browse files from gallery/disk</div>
              </div>
            </div>
          )}
        </div>

        {/* Multi-Device Source Options: Camera vs Laptop/Phone Gallery */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="py-3 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer hover:scale-102"
          >
            <Camera className="w-4 h-4 text-emerald-600" />
            <span>Take Photo (Camera)</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-3 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer hover:scale-102"
          >
            <FolderOpen className="w-4 h-4 text-emerald-600" />
            <span>Upload from Device</span>
          </button>
        </div>

        {/* Quick Sample Presets */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold">Or test with demo sample photos:</span>
            <span className="text-[10px] text-emerald-700 font-bold">1-Click Test</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {sampleImages.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(s)}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 flex items-center gap-2 transition-all text-left group cursor-pointer"
              >
                <span className="text-base group-hover:scale-110 transition-transform">{s.icon}</span>
                <span className="text-[11px] font-bold text-slate-700 truncate">{s.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Run AI Analysis Button */}
        <button
          type="button"
          disabled={!imagePreview || scanning}
          onClick={handleRunScan}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-emerald-600/20 disabled:opacity-50 hover:scale-102 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>{scanning ? 'Analyzing Produce Matrix...' : 'Analyze Produce Quality'}</span>
        </button>
      </div>

      {/* AI Screening Breakdown Results */}
      {result && (
        <div className="card-clean p-6 rounded-3xl border border-slate-200 bg-white space-y-4 shadow-sm rounded-3xl animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Screening Assessment Result</div>
              <div className="text-xl font-black font-outfit text-emerald-700 flex items-center gap-2">
                <span>{result.status}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500 font-semibold">AI Confidence</div>
              <div className="text-base font-black text-slate-900 font-outfit">{result.confidenceScore}%</div>
            </div>
          </div>

          {/* Quality Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="text-[10px] text-emerald-800 font-semibold">Estimated Moisture</div>
              <div className="text-lg font-black text-emerald-700 font-outfit">{result.estimatedMoisturePercent}%</div>
              <div className="text-[9px] text-slate-500 font-medium">Max limit: 14%</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500 font-semibold">Discoloration</div>
              <div className="text-lg font-black text-slate-900 font-outfit">{result.discolorationPercent}%</div>
              <div className="text-[9px] text-slate-400">Within FAQ norm</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500 font-semibold">Damaged Grains</div>
              <div className="text-lg font-black text-slate-900 font-outfit">{result.damagedGrainsPercent}%</div>
              <div className="text-[9px] text-slate-400">Tolerance &lt; 5%</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500 font-semibold">Foreign Matter</div>
              <div className="text-lg font-black text-slate-900 font-outfit">{result.foreignMatterPercent}%</div>
              <div className="text-[9px] text-slate-400">Chaff / dust</div>
            </div>
          </div>

          {/* Recommendation Note */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
            <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>AI Recommendation for Mandi Gate:</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium pl-5.5">
              {result.recommendation}
            </p>
          </div>

          <div className="text-[11px] text-slate-500 italic pt-1">
            ⚠️ <span className="font-semibold">Disclaimer:</span> {result.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
};
