/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  FileImage, 
  Zap, 
  Binary, 
  BarChart3, 
  ArrowRightLeft,
  ChevronRight,
  Info,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  Maximize,
  ZoomIn,
  ZoomOut,
  X,
  Eye,
  ChevronDown,
  Globe,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HuffmanEngine, HuffmanNode, CodeMap } from './lib/huffman.ts';
import { translations, Language } from './translations.ts';

// Types
interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  ratio: number;
  width: number;
  height: number;
  duration: number;
  codeMap: CodeMap;
  encodedData: Uint8Array;
  totalBits: number;
}

interface DecompressionResult {
  imageSrc: string;
  width: number;
  height: number;
  duration: number;
}

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const stars: { x: number; y: number; z: number; o: number }[] = [];
    const numStars = 800;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();

    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * canvas.width - canvas.width / 2,
            y: Math.random() * canvas.height - canvas.height / 2,
            z: Math.random() * canvas.width,
            o: Math.random()
        });
    }

    let speed = 2;
    const acceleration = 1.05;

    const draw = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        speed *= acceleration; 

        let star;
        for (let i = 0; i < numStars; i++) {
            star = stars[i];
            
            const prevX = cx + star.x / (star.z / cx);
            const prevY = cy + star.y / (star.z / cx);

            star.z -= speed;
            
            if (star.z <= 0) {
                star.z = canvas.width;
                star.x = Math.random() * canvas.width - cx;
                star.y = Math.random() * canvas.height - cy;
                continue;
            }

            const nextX = cx + star.x / (star.z / cx);
            const nextY = cy + star.y / (star.z / cx);
            
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(nextX, nextY);
            ctx.strokeStyle = `rgba(165, 180, 252, ${star.o || 1})`;
            ctx.lineWidth = Math.max(0.5, (1 - star.z / canvas.width) * 3);
            ctx.stroke();
        }

        animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const timer = setTimeout(() => {
        onComplete();
    }, 2500);

    return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animationFrameId);
        clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[1000] bg-[#020617] flex items-center justify-center overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 1.5, type: "spring" }}
        className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 px-6 text-center md:text-left"
      >
        <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.5)]">
           <svg className="w-10 h-10 md:w-12 md:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
           </svg>
        </div>
        <div className="flex flex-col items-center md:items-start group">
          <a 
            href="https://beacons.ai/phuong_desginer" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block hover:opacity-80 transition-opacity"
          >
            <h1 className="text-4xl md:text-7xl font-bold tracking-tighter text-white drop-shadow-2xl">
              Pixel<span className="text-indigo-400 font-light ml-1">Compress</span>
            </h1>
          </a>
          <a 
            href="https://beacons.ai/phuong_desginer" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] md:text-xs font-bold text-indigo-400/60 hover:text-indigo-400 tracking-[0.2em] uppercase mt-1 md:mt-2 transition-colors"
          >
            By Phuong Designer
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('pixelcompress_lang');
    return (saved as Language) || 'vi';
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('pixelcompress_theme');
    return (saved as 'light' | 'dark') || 'dark';
  });
  const t = translations[language];

  useEffect(() => {
    localStorage.setItem('pixelcompress_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('pixelcompress_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [originalFileSize, setOriginalFileSize] = useState<number>(0);
  const [compressionMode, setCompressionMode] = useState<'grayscale' | 'rgb' | 'rgba' | 'cmyk'>('rgb');
  const [scale, setScale] = useState(50);
  const [exportFormat, setExportFormat] = useState<'huff' | 'jpg' | 'png' | 'webp'>('jpg');
  const [bitDepth, setBitDepth] = useState<'8bit' | '10bit' | '16bit' | '24bit' | '32bit'>('10bit');
  const [quality, setQuality] = useState(60);
  const [activeTab, setActiveTab] = useState<'compress' | 'decompress' | 'upscale'>('compress');
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [decompressionResult, setDecompressionResult] = useState<DecompressionResult | null>(null);
  const [upscaleFactor, setUpscaleFactor] = useState<number>(2);
  const [customFactorInput, setCustomFactorInput] = useState<string>("");
  const [aiModelType, setAiModelType] = useState<'free' | 'paid'>('free');
  const [upscaleResult, setUpscaleResult] = useState<string | null>(null);
  const [upscaleResultDimensions, setUpscaleResultDimensions] = useState<{width: number, height: number} | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [freeUsagesLeft, setFreeUsagesLeft] = useState<number>(() => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const dataStr = localStorage.getItem('huff_upscale_limits');
      if (dataStr) {
        const data = JSON.parse(dataStr);
        if (data.date === today) {
          return data.remaining;
        }
      }
    } catch (e) {}
    return 5; // 5 free usages per day
  });

  useEffect(() => {
    try {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('huff_upscale_limits', JSON.stringify({ date: today, remaining: freeUsagesLeft }));
    } catch (e) {}
  }, [freeUsagesLeft]);

  const [previewZoom, setPreviewZoom] = useState(1);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (compressionResult && compressionResult.encodedData) {
      if (exportFormat !== 'huff') {
        const type = exportFormat === 'jpg' ? 'image/jpeg' : `image/${exportFormat}`;
        const blob = new Blob([compressionResult.encodedData], { type });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
      } else {
        // For Huffman, we can't show the blob, so we must show what it would look like decoded
        // This is essentially the quantized image shown before.
        // We handle this in the compressImage function by creating a canvas snapshot
      }
    } else {
      setPreviewUrl(null);
    }
  }, [compressionResult, exportFormat]);

  useEffect(() => {
    if (showPreviewModal || (upscaleResult && isZoomed)) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [showPreviewModal, upscaleResult, isZoomed]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Save original file name without extension
    const nameWithoutExt = file.name.split('.').slice(0, -1).join('.') || "image";
    setFileName(nameWithoutExt);
    setOriginalFileSize(file.size);

    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setCompressionResult(null);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Run Compression
  const compressImage = async () => {
    if (!image || !canvasRef.current) return;
    setIsProcessing(true);
    setError(null);

    const startTime = performance.now();

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error("Could not get canvas context");

      // Calculate scaled dimensions
      const scaledWidth = Math.max(1, Math.round(image.width * (scale / 100)));
      const scaledHeight = Math.max(1, Math.round(image.height * (scale / 100)));

      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
      ctx.drawImage(image, 0, 0, scaledWidth, scaledHeight);

      if (exportFormat === 'huff') {
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let pixels: Uint8ClampedArray;

        // Apply Quantization based on Bit Depth
        // This effectively reduces the symbol space, improving Huffman ratios
        const quantize = (val: number, bits: number) => {
          if (bits >= 8) return val;
          const levels = Math.pow(2, bits);
          const step = 256 / levels;
          return Math.min(255, Math.floor(val / step) * step);
        };

        if (compressionMode === 'grayscale') {
          pixels = new Uint8ClampedArray(canvas.width * canvas.height);
          const bits = parseInt(bitDepth.replace('bit', ''));
          for (let i = 0; i < imageData.data.length; i += 4) {
            const avg = Math.round((imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3);
            pixels[i / 4] = quantize(avg, bits);
          }
        } else if (compressionMode === 'rgb') {
          pixels = new Uint8ClampedArray(canvas.width * canvas.height * 3);
          let pIdx = 0;
          // Distribute bits across channels for the selected total bit depth
          let rb: number, gb: number, bb: number;
          if (bitDepth === '8bit') { rb = 2; gb = 3; bb = 3; }
          else if (bitDepth === '10bit') { rb = 3; gb = 3; bb = 4; }
          else if (bitDepth === '16bit') { rb = 5; gb = 6; bb = 5; }
          else { rb = 8; gb = 8; bb = 8; }

          for (let i = 0; i < imageData.data.length; i += 4) {
            pixels[pIdx++] = quantize(imageData.data[i], rb);
            pixels[pIdx++] = quantize(imageData.data[i + 1], gb);
            pixels[pIdx++] = quantize(imageData.data[i + 2], bb);
          }
        } else if (compressionMode === 'cmyk') {
          pixels = new Uint8ClampedArray(canvas.width * canvas.height * 4);
          let pIdx = 0;
          let cb: number, mb: number, yb: number, kb: number;
          if (bitDepth === '8bit') { cb = 2; mb = 2; yb = 2; kb = 2; }
          else if (bitDepth === '10bit') { cb = 2; mb = 3; yb = 3; kb = 2; }
          else if (bitDepth === '16bit') { cb = 4; mb = 4; yb = 4; kb = 4; }
          else if (bitDepth === '24bit') { cb = 6; mb = 6; yb = 6; kb = 6; }
          else { cb = 8; mb = 8; yb = 8; kb = 8; }

          for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i] / 255;
            const g = imageData.data[i + 1] / 255;
            const b = imageData.data[i + 2] / 255;

            const k = 1 - Math.max(r, g, b);
            const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
            const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
            const y = k === 1 ? 0 : (1 - b - k) / (1 - k);

            pixels[pIdx++] = quantize(Math.round(c * 255), cb);
            pixels[pIdx++] = quantize(Math.round(m * 255), mb);
            pixels[pIdx++] = quantize(Math.round(y * 255), yb);
            pixels[pIdx++] = quantize(Math.round(k * 255), kb);
          }
        } else {
          // RGBA
          pixels = new Uint8ClampedArray(imageData.data.length);
          let rb: number, gb: number, bb: number, ab: number;
          if (bitDepth === '8bit') { rb = 2; gb = 2; bb = 2; ab = 2; }
          else if (bitDepth === '10bit') { rb = 2; gb = 3; bb = 3; ab = 2; }
          else if (bitDepth === '16bit') { rb = 4; gb = 4; bb = 4; ab = 4; }
          else if (bitDepth === '24bit') { rb = 6; gb = 6; bb = 6; ab = 6; }
          else { rb = 8; gb = 8; bb = 8; ab = 8; }

          for (let i = 0; i < imageData.data.length; i++) {
            const channel = i % 4;
            let b = rb;
            if (channel === 1) b = gb;
            if (channel === 2) b = bb;
            if (channel === 3) b = ab;
            pixels[i] = quantize(imageData.data[i], b);
          }
        }

        const freqs = new Map<number, number>();
        for (let i = 0; i < pixels.length; i++) {
          const val = pixels[i];
          freqs.set(val, (freqs.get(val) || 0) + 1);
        }

        const tree = HuffmanEngine.buildTree(freqs);
        const codeMap = HuffmanEngine.generateCodeMap(tree);
        const { buffer: packed, totalBits } = HuffmanEngine.encodeToBytes(pixels, codeMap);
        const endTime = performance.now();

        const serializableCodeMap: Record<string, string> = {};
        Object.entries(codeMap).forEach(([k, v]) => serializableCodeMap[k] = v);
        
        // Generate preview URL for Huffman
        const previewCanvas = document.createElement('canvas');
        previewCanvas.width = canvas.width;
        previewCanvas.height = canvas.height;
        const pCtx = previewCanvas.getContext('2d')!;
        const pImageData = pCtx.createImageData(canvas.width, canvas.height);
        
        if (compressionMode === 'grayscale') {
          for (let i = 0; i < pixels.length; i++) {
            pImageData.data[i * 4] = pixels[i];
            pImageData.data[i * 4 + 1] = pixels[i];
            pImageData.data[i * 4 + 2] = pixels[i];
            pImageData.data[i * 4 + 3] = 255;
          }
        } else if (compressionMode === 'rgb') {
          for (let i = 0; i < canvas.width * canvas.height; i++) {
            pImageData.data[i * 4] = pixels[i * 3];
            pImageData.data[i * 4 + 1] = pixels[i * 3 + 1];
            pImageData.data[i * 4 + 2] = pixels[i * 3 + 2];
            pImageData.data[i * 4 + 3] = 255;
          }
        } else if (compressionMode === 'cmyk') {
          for (let i = 0; i < canvas.width * canvas.height; i++) {
            const c = pixels[i * 4] / 255;
            const m = pixels[i * 4 + 1] / 255;
            const y = pixels[i * 4 + 2] / 255;
            const k = pixels[i * 4 + 3] / 255;
            pImageData.data[i * 4] = 255 * (1 - c) * (1 - k);
            pImageData.data[i * 4 + 1] = 255 * (1 - m) * (1 - k);
            pImageData.data[i * 4 + 2] = 255 * (1 - y) * (1 - k);
            pImageData.data[i * 4 + 3] = 255;
          }
        } else {
          pImageData.data.set(pixels);
        }
        pCtx.putImageData(pImageData, 0, 0);
        setPreviewUrl(previewCanvas.toDataURL());

        const headerSize = 64; 
        const codeMapSize = JSON.stringify(serializableCodeMap).length;
        const totalCompressedSize = packed.length + codeMapSize + headerSize;

        setCompressionResult({
          originalSize: originalFileSize,
          compressedSize: totalCompressedSize,
          ratio: ((originalFileSize - totalCompressedSize) / originalFileSize) * 100,
          width: canvas.width,
          height: canvas.height,
          duration: endTime - startTime,
          codeMap,
          encodedData: packed,
          totalBits,
        });
      } else {
        // STANDARD FORMAT LOGIC (Iterative compression to force smaller size)
        let type = exportFormat === 'jpg' ? 'image/jpeg' : `image/${exportFormat}`;
        let testQuality = quality;
        let testScale = scale / 100;
        let finalBlob: Blob | null = null;
        let finalWidth = scaledWidth;
        let finalHeight = scaledHeight;
        let attempts = 0;

        while (attempts < 15) {
          finalWidth = Math.max(1, Math.floor(image.width * testScale));
          finalHeight = Math.max(1, Math.floor(image.height * testScale));
          
          canvas.width = finalWidth;
          canvas.height = finalHeight;
          ctx.drawImage(image, 0, 0, finalWidth, finalHeight);
          
          const q = (exportFormat === 'jpg' || exportFormat === 'webp') ? testQuality / 100 : undefined;
          finalBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), type, q));
          
          if (!finalBlob) throw new Error("Conversion failed");
          
          if (finalBlob.size < originalFileSize * 0.99) {
             break; // Successfully compressed below original size
          }
          
          if (exportFormat === 'png') {
              testScale *= 0.8; 
          } else {
              if (testQuality > 20) {
                  testQuality -= 15;
              } else {
                  testScale *= 0.8;
              }
          }
          
          if (testScale < 0.1) break; // Hard limit below 10%
          attempts++;
        }
        
        if (!finalBlob) throw new Error("Conversion failed");

        // Update UI to reflect the actual values used to achieve this compression
        if (testQuality !== quality && (exportFormat === 'jpg' || exportFormat === 'webp')) {
           setQuality(Math.max(1, Math.floor(testQuality)));
        }
        if (Math.abs(testScale * 100 - scale) > 1) {
           setScale(Math.max(1, Math.floor(testScale * 100)));
        }

        const endTime = performance.now();

        setCompressionResult({
          originalSize: originalFileSize,
          compressedSize: finalBlob.size,
          ratio: ((originalFileSize - finalBlob.size) / originalFileSize) * 100,
          width: finalWidth,
          height: finalHeight,
          duration: endTime - startTime,
          codeMap: {},
          encodedData: new Uint8Array(await finalBlob.arrayBuffer()),
          totalBits: 0,
        });
      }

    } catch (err) {
      console.error(err);
      setError("Quá trình nén thất bại. Vui lòng thử lại.");
    } finally {
      setIsProcessing(false);
    }
  };

  const saveCompressedFile = () => {
    if (!compressionResult) return;
    
    if (exportFormat === 'huff') {
      const metadata = {
        w: compressionResult.width,
        h: compressionResult.height,
        m: compressionMode,
        cm: compressionResult.codeMap,
        bl: compressionResult.totalBits
      };

      const metaBlob = new Blob([JSON.stringify(metadata) + "|||"], { type: 'application/json' });
      const dataBlob = new Blob([compressionResult.encodedData], { type: 'application/octet-stream' });
      const finalBlob = new Blob([metaBlob, dataBlob], { type: 'application/x-huffman' });

      const url = URL.createObjectURL(finalBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}_compressed.huff`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const type = exportFormat === 'jpg' ? 'image/jpeg' : `image/${exportFormat}`;
      const ext = exportFormat === 'jpg' ? 'jpg' : exportFormat;
      const blob = new Blob([compressionResult.encodedData], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}_optimized.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleDecompressUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setIsProcessing(true);
        const startTime = performance.now();
        const buffer = event.target?.result as ArrayBuffer;
        const text = new TextDecoder().decode(buffer);
        const separatorIdx = text.indexOf("|||");
        
        if (separatorIdx === -1) throw new Error("Invalid format");

        const metaPart = text.substring(0, separatorIdx);
        const meta = JSON.parse(metaPart);
        const offset = new TextEncoder().encode(metaPart + "|||").length;
        const packed = new Uint8Array(buffer.slice(offset));

        let pixelsCount;
        if (meta.m === 'grayscale') pixelsCount = meta.w * meta.h;
        else if (meta.m === 'rgb') pixelsCount = meta.w * meta.h * 3;
        else pixelsCount = meta.w * meta.h * 4; // covers rgba and cmyk

        const reverseMap: Record<string, number> = {};
        Object.entries(meta.cm).forEach(([k, v]) => reverseMap[v as string] = parseInt(k));

        const pixels = HuffmanEngine.decodeFromBytes(packed, meta.bl, reverseMap, pixelsCount);

        const canvas = document.createElement('canvas');
        canvas.width = meta.w;
        canvas.height = meta.h;
        const ctx = canvas.getContext('2d')!;
        const imageData = ctx.createImageData(meta.w, meta.h);

        if (meta.m === 'grayscale') {
          for (let i = 0; i < pixels.length; i++) {
            imageData.data[i * 4] = pixels[i];
            imageData.data[i * 4 + 1] = pixels[i];
            imageData.data[i * 4 + 2] = pixels[i];
            imageData.data[i * 4 + 3] = 255;
          }
        } else if (meta.m === 'rgb') {
          for (let i = 0; i < meta.w * meta.h; i++) {
            imageData.data[i * 4] = pixels[i * 3];
            imageData.data[i * 4 + 1] = pixels[i * 3 + 1];
            imageData.data[i * 4 + 2] = pixels[i * 3 + 2];
            imageData.data[i * 4 + 3] = 255;
          }
        } else if (meta.m === 'cmyk') {
          for (let i = 0; i < meta.w * meta.h; i++) {
            const c = pixels[i * 4] / 255;
            const m = pixels[i * 4 + 1] / 255;
            const y = pixels[i * 4 + 2] / 255;
            const k = pixels[i * 4 + 3] / 255;

            imageData.data[i * 4] = 255 * (1 - c) * (1 - k);
            imageData.data[i * 4 + 1] = 255 * (1 - m) * (1 - k);
            imageData.data[i * 4 + 2] = 255 * (1 - y) * (1 - k);
            imageData.data[i * 4 + 3] = 255;
          }
        } else {
          imageData.data.set(pixels);
        }
        ctx.putImageData(imageData, 0, 0);

        setDecompressionResult({
          imageSrc: canvas.toDataURL(),
          width: meta.w,
          height: meta.h,
          duration: performance.now() - startTime
        });
      } catch (err) {
        console.error(err);
        setError("Invalid Huffman file format.");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUpscale = async () => {
    if (!image) return;
    
    if (aiModelType === 'free' && freeUsagesLeft <= 0) {
      setError("Bạn đã hết lượt sử dụng miễn phí trong ngày hôm nay. Hãy sử dụng model có phí.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      if (aiModelType === 'free') {
        // Fast local super resolution mockup using Canvas + SVG Convolution Matrix for sharpening
        // Works nicely in browser and looks much better than native pixel scaling.
        await new Promise(resolve => setTimeout(resolve, 800)); // simulate AI delay
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = Math.round(image.width * upscaleFactor);
        finalCanvas.height = Math.round(image.height * upscaleFactor);
        const fctx = finalCanvas.getContext('2d');
        if (!fctx) throw new Error("Could not get context");
        fctx.imageSmoothingEnabled = true;
        fctx.imageSmoothingQuality = 'high';
        // apply sharpen filter
        fctx.filter = 'url(#sharpenFunc) contrast(1.05) saturate(1.1)';
        fctx.drawImage(image, 0, 0, finalCanvas.width, finalCanvas.height);
        
        setUpscaleResult(finalCanvas.toDataURL('image/png'));
        setUpscaleResultDimensions({ width: finalCanvas.width, height: finalCanvas.height });
        setFreeUsagesLeft(prev => Math.max(0, prev - 1));
        setIsProcessing(false);
        return;
      }

      const base64Data = image.src.split(',')[1];
      const mimeTypeMatch = image.src.match(/^data:(.*?);/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';

      if (aiModelType === 'paid') {
        // @ts-ignore
        if (typeof window.aistudio !== 'undefined' && !await window.aistudio.hasSelectedApiKey()) {
          // @ts-ignore
          await window.aistudio.openSelectKey();
        }
      }

      // Use dynamic import for GoogleGenAI to avoid issues if it requires polyfill
      const { GoogleGenAI } = await import('@google/genai');
      
      // @ts-ignore
      const apiKey = aiModelType === 'paid' 
        // @ts-ignore
        ? process.env.API_KEY || import.meta.env.VITE_API_KEY || process.env.GEMINI_API_KEY
        // @ts-ignore
        : process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
        
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: aiModelType === 'paid' ? 'gemini-3.1-flash-image-preview' : 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: `Please upscale this image by ${upscaleFactor}x. Enhance the details, sharpness, and overall quality without changing the original content or style. Output a high-resolution version.`,
            },
          ],
        },
      });

      let upscaledImageUrl = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          upscaledImageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (upscaledImageUrl) {
        // Measure the result from Gemini, because AI models may return arbitrary sizes 
        // that are close to but not strictly equal to the target exact pixel calculation.
        const img = new Image();
        img.onload = () => {
           setUpscaleResult(upscaledImageUrl);
           setUpscaleResultDimensions({ width: img.width, height: img.height });
           setIsProcessing(false);
        };
        img.src = upscaledImageUrl;
        return; // wait for onload to finish
      } else {
        throw new Error("Không nhận được hình ảnh từ Gemini.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Quá trình phóng to thất bại: " + (err.message || 'Lỗi không xác định'));
    } finally {
      setIsProcessing(false);
    }
  };

  const saveUpscaledImage = () => {
    if (!upscaleResult) return;
    const a = document.createElement('a');
    a.href = upscaleResult;
    a.download = `${fileName}_upscaled_${upscaleFactor}x.png`;
    a.click();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    return (bytes / 1024).toFixed(1) + " KB";
  };

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      <div className={`h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-black'} font-sans flex flex-col transition-colors duration-300`}>
        <svg width="0" height="0" className="absolute pointer-events-none">
          <defs>
            <filter id="sharpenFunc">
              <feConvolveMatrix order="3" preserveAlpha="true" kernelMatrix="1 -1 1 -1 5 -1 1 -1 1" />
            </filter>
          </defs>
        </svg>
        {/* Header Navigation */}
        <nav className={`h-16 border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white/70'} flex items-center justify-between px-4 md:px-8 backdrop-blur-md sticky top-0 z-50 shrink-0 transition-colors duration-300`}>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className={`flex items-center gap-2 md:gap-3 rounded-xl ${theme === 'dark' ? 'hover:bg-slate-800/50 text-slate-200' : 'hover:bg-slate-100 text-black'} p-2 -ml-1 md:-ml-2 transition-colors focus:outline-none`}
          >
            <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <a 
                href="https://beacons.ai/phuong_desginer" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-bold tracking-tight text-lg md:text-xl hover:text-indigo-400 transition-colors"
              >
                Pixel<span className="text-indigo-500 font-light">Compress</span>
              </a>
              <a 
                href="https://beacons.ai/phuong_desginer" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[8px] font-bold text-slate-500 hover:text-indigo-500 tracking-widest uppercase transition-colors"
              >
                phuong_desginer
              </a>
            </div>
            <ChevronDown size={16} className={`transition-transform ${showMenu ? 'rotate-180' : ''} ${theme === 'dark' ? 'text-slate-400' : 'text-black'}`} />
          </button>
          
          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
                <motion.div 
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute top-14 left-0 w-64 ${theme === 'dark' ? 'bg-slate-900 border-slate-700/50' : 'bg-white border-slate-200'} border rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col py-2`}
                >
                  <button 
                    onClick={() => { setActiveTab('compress'); setShowMenu(false); }}
                    className={`px-4 py-3 text-left text-xs md:text-sm font-bold uppercase tracking-wide transition-colors flex items-center justify-between ${activeTab === 'compress' ? (theme === 'dark' ? 'bg-indigo-600/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600') : (theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-black/60 hover:bg-slate-50 hover:text-black')}`}
                  >
                    <span>{t.compress}</span>
                    {activeTab === 'compress' && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>}
                  </button>
                  <button 
                    onClick={() => { setActiveTab('decompress'); setShowMenu(false); }}
                    className={`px-4 py-3 text-left text-xs md:text-sm font-bold uppercase tracking-wide transition-colors flex items-center justify-between ${activeTab === 'decompress' ? (theme === 'dark' ? 'bg-indigo-600/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600') : (theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-black/60 hover:bg-slate-50 hover:text-black')}`}
                  >
                    <span>{t.decompress}</span>
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-500 text-[8px] font-black rounded uppercase tracking-tighter border border-amber-500/30">{t.beta}</span>
                      {activeTab === 'decompress' && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>}
                    </div>
                  </button>
                  <button 
                    onClick={() => { setActiveTab('upscale'); setShowMenu(false); }}
                    className={`px-4 py-3 text-left text-xs md:text-sm font-bold uppercase tracking-wide transition-colors flex items-center justify-between ${activeTab === 'upscale' ? (theme === 'dark' ? 'bg-indigo-600/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600') : (theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-black/60 hover:bg-slate-50 hover:text-black')}`}
                  >
                    <span>{t.upscale}</span>
                    <div className="flex items-center gap-2">
                       <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-500 text-[8px] font-black rounded uppercase tracking-tighter border border-amber-500/30">{t.beta}</span>
                       {activeTab === 'upscale' && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>}
                    </div>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-black'}`}
            title={t.theme}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Language Selector */}
          <div className="relative">
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)}
              className={`flex items-center gap-2 p-2 px-3 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-black'}`}
            >
              <Globe size={18} />
              <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">{language}</span>
            </button>
            
            <AnimatePresence>
              {showLangMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)}></div>
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className={`absolute top-12 right-0 w-48 ${theme === 'dark' ? 'bg-slate-900 border-slate-700/50' : 'bg-white border-slate-200'} border rounded-xl shadow-2xl overflow-hidden z-50 py-2 max-h-[70vh] overflow-y-auto custom-scrollbar`}
                  >
                    {(Object.keys(translations) as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => { setLanguage(lang); setShowLangMenu(false); }}
                        className={`w-full px-4 py-2 text-left text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-between ${language === lang ? (theme === 'dark' ? 'bg-indigo-600/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600') : (theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-black/60 hover:bg-slate-50 hover:text-black')}`}
                      >
                        <span>{lang === 'en' ? 'English' : lang === 'vi' ? 'Tiếng Việt' : lang === 'zh-TW' ? '繁體中文' : lang === 'ko' ? '한국어' : lang === 'lo' ? 'ລາວ' : lang === 'th' ? 'ไทย' : lang === 'de' ? 'Deutsch' : lang === 'fr' ? 'Français' : lang === 'fa' ? 'فارسی' : 'हिन्दी'}</span>
                        {language === lang && <CheckCircle2 size={12} />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full p-4 md:p-6 lg:p-8 pb-12 md:pb-16 lg:pb-20 flex flex-col gap-6 lg:gap-8 min-h-0 relative custom-scrollbar overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'compress' ? (
            <motion.div 
              key="compress-zone"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 min-h-0 w-full flex-1"
            >
              {/* Column 1: Source Data */}
              <div className="lg:col-span-1 flex flex-col gap-6 lg:min-h-[300px] w-full">
                <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-2xl shadow-black/20' : 'bg-white border-slate-200 shadow-xl'} border rounded-xl p-5 md:p-6 flex-1 flex flex-col transition-colors duration-300`}>
                  <h3 className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-black'} mb-5 shrink-0`}>{t.sourceData}</h3>
                  {!image ? (
                    <div className={`flex-1 border-2 border-dashed ${theme === 'dark' ? 'border-slate-700/50 bg-slate-950/30' : 'border-slate-200 bg-slate-50'} rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-indigo-500/30 hover:bg-black/5 transition-all cursor-pointer relative group min-h-[200px]`}>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      <div className={`w-12 h-12 shrink-0 rounded-full ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-white text-black shadow-sm'} flex items-center justify-center mb-4 group-hover:text-indigo-400 group-hover:scale-110 transition-all`}>
                        <Upload size={20} />
                      </div>
                      <p className="text-sm font-medium mb-1">{t.dropHint}</p>
                      <p className={`text-[10px] ${theme === 'dark' ? 'text-slate-400' : 'text-black font-bold'} font-mono uppercase tracking-tight`}>{t.dropHintDesc}</p>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col gap-5 min-h-0">
                      <div 
                        onClick={() => {
                          setShowPreviewModal(true);
                          setPreviewZoom(1);
                          setPreviewPosition({ x: 0, y: 0 });
                        }}
                        className={`flex-1 min-h-[220px] md:min-h-[280px] ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'} rounded-lg overflow-hidden border flex items-center justify-center p-2 relative group cursor-pointer`}
                      >
                        <img src={image.src} alt="Preview" className="max-w-full max-h-full object-contain rounded" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <Eye className="text-white" size={24} />
                        </div>
                      </div>
                      <div className="space-y-3 shrink-0">
                        <div className={`flex justify-between items-center text-xs font-mono font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-black'}`}>
                          <span className="opacity-60">{t.originalSize}</span>
                          <span className={theme === 'dark' ? 'text-slate-200 font-bold' : 'text-black font-black'}>{formatSize(originalFileSize)}</span>
                        </div>
                        <div className={`flex justify-between items-center text-xs font-mono font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-black'}`}>
                          <span className="opacity-60">{t.resolution}</span>
                          <span className={theme === 'dark' ? 'text-slate-200 font-bold' : 'text-black font-black'}>{image.width} × {image.height}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setImage(null)}
                        className={`w-full shrink-0 py-3 text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400 border-slate-800 hover:bg-slate-800' : 'text-black border-slate-300 hover:bg-slate-50'} border rounded-lg transition-colors`}
                      >
                        {t.changeFile}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Column 2: Algorithm Settings */}
              <div className="lg:col-span-1 flex flex-col gap-6 lg:min-h-[300px] w-full">
                <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-lg'} border rounded-xl p-6 space-y-6 flex-1 flex flex-col transition-colors duration-300 lg:overflow-y-auto lg:custom-scrollbar`}>
                  <h3 className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-black'} mb-2`}>{t.config}</h3>
                  
                  <div className="space-y-6 flex-1">
                    <div className="space-y-2">
                       <span className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-black'}`}>{t.exportFormat}</span>
                       <div className="grid grid-cols-2 xs:grid-cols-4 lg:grid-cols-2 gap-2">
                          {(['huff', 'jpg', 'png', 'webp'] as const).map((f) => (
                            <button
                              key={f}
                              onClick={() => setExportFormat(f)}
                              className={`py-2 text-[10px] font-bold uppercase border rounded-lg transition-all ${exportFormat === f ? 'bg-indigo-600 border-indigo-600 text-white' : (theme === 'dark' ? 'border-slate-800 text-slate-500 hover:border-slate-700' : 'border-slate-300 text-black font-black hover:bg-slate-50')}`}
                            >
                              {f === 'huff' ? 'HUFF' : f}
                            </button>
                          ))}
                       </div>
                    </div>

                    {(exportFormat === 'jpg' || exportFormat === 'webp') && (
                      <div className="space-y-3">
                        <div className={`flex justify-between items-center text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-black'}`}>
                          <span>{t.quality}</span>
                          <span className="text-emerald-500 font-mono font-bold">{quality}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="100" 
                          value={quality} 
                          onChange={(e) => setQuality(parseInt(e.target.value))}
                          className={`w-full h-1.5 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'} rounded-lg appearance-none cursor-pointer accent-emerald-500`}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                       <span className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-black'}`}>{t.bitDepth}</span>
                       <div className="grid grid-cols-3 gap-1.5">
                          {(['8bit', '10bit', '16bit', '24bit', '32bit'] as const).map((b) => (
                            <button
                              key={b}
                              onClick={() => setBitDepth(b)}
                              className={`py-2 text-[8px] font-bold uppercase border rounded-lg transition-all ${bitDepth === b ? 'bg-indigo-600 border-indigo-600 text-white' : (theme === 'dark' ? 'border-slate-800 text-slate-500 hover:border-slate-700' : 'border-slate-300 text-black font-black hover:bg-slate-50')}`}
                            >
                              {b}
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-2">
                       <span className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-black'}`}>{t.colorMode}</span>
                       <div className="grid grid-cols-2 gap-2">
                          {(['grayscale', 'rgb', 'rgba', 'cmyk'] as const).map((m) => (
                            <button
                              key={m}
                              onClick={() => setCompressionMode(m)}
                              className={`py-2 text-[10px] font-bold uppercase border rounded-lg transition-all ${compressionMode === m ? 'bg-indigo-600 border-indigo-600 text-white' : (theme === 'dark' ? 'border-slate-800 text-slate-500 hover:border-slate-700' : 'border-slate-300 text-black font-black hover:bg-slate-50')}`}
                            >
                              {m}
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-3">
                      <div className={`flex justify-between items-center text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-black'}`}>
                        <span>{t.scale}</span>
                        <span className="text-indigo-500 font-mono font-bold">{scale}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="100" 
                        value={scale} 
                        onChange={(e) => setScale(parseInt(e.target.value))}
                        className={`w-full h-1.5 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'} rounded-lg appearance-none cursor-pointer accent-indigo-500`}
                      />
                      <p className={`text-[10px] ${theme === 'dark' ? 'text-slate-600' : 'text-black'} font-mono italic font-bold`}>
                        {image ? `${Math.round(image.width * (scale / 100))} x ${Math.round(image.height * (scale / 100))} PX` : "---"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 shrink-0">
                    <button 
                      onClick={compressImage}
                      disabled={!image || isProcessing}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs tracking-widest shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed group h-[52px]"
                    >
                      {isProcessing ? (
                        <RefreshCcw className="animate-spin mx-auto" size={18} />
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Zap size={16} fill="currentColor" />
                          {t.startCompress}
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Performance & Output Results */}
              {compressionResult ? (
                <>
                  {/* Column 3: Performance */}
                  <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-xl p-6 md:p-8 flex flex-col lg:col-span-1 xl:col-span-1 lg:min-h-[300px] transition-colors duration-300 shadow-xl`}>
                    <h3 className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-indigo-400' : 'text-black'} mb-6`}>{t.performance}</h3>
                    <div className="space-y-6 flex-1">
                      <div className="flex flex-col">
                        <span className={`text-[9px] ${theme === 'dark' ? 'text-slate-400' : 'text-black'} uppercase tracking-widest mb-1.5 font-bold`}>{t.compressionRatio}</span>
                        <span className={`text-2xl md:text-3xl font-light font-mono italic ${compressionResult.ratio > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {(compressionResult.originalSize / compressionResult.compressedSize).toFixed(2)}:1
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[9px] ${theme === 'dark' ? 'text-slate-400' : 'text-black'} uppercase tracking-widest mb-1.5 font-bold`}>
                          {compressionResult.ratio > 0 ? t.savings : 'Tăng kích thước (Overflow)'}
                        </span>
                        <span className={`text-2xl md:text-3xl font-light font-mono italic ${compressionResult.ratio > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {compressionResult.ratio.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[9px] ${theme === 'dark' ? 'text-slate-400' : 'text-black'} uppercase tracking-widest mb-1.5 font-bold`}>{t.actualSize}</span>
                        <span className={`text-xl md:text-2xl font-light font-mono ${theme === 'dark' ? 'text-white' : 'text-black'} italic`}>
                          {formatSize(compressionResult.compressedSize)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className={`text-[9px] ${theme === 'dark' ? 'text-slate-400' : 'text-black'} uppercase tracking-widest block mb-1 font-bold`}>{t.density}</span>
                          <p className={`text-base font-mono font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-black'}`}>{(compressionResult.compressedSize * 8 / (compressionResult.width * compressionResult.height)).toFixed(2)} b/p</p>
                        </div>
                        <div>
                          <span className={`text-[9px] ${theme === 'dark' ? 'text-slate-400' : 'text-black'} uppercase tracking-widest block mb-1 font-bold`}>{t.latency}</span>
                          <p className={`text-base font-mono font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-black'}`}>{compressionResult.duration.toFixed(1)} ms</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-800/50">
                      <button 
                        onClick={saveCompressedFile}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[9px] tracking-widest shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-3"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Column 4: Preview & Extras */}
                  <div className="lg:col-span-3 xl:col-span-1 flex flex-col gap-6 lg:min-h-[300px]">
                    {/* Live Preview Panel */}
                    <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xl'} border rounded-xl p-4 flex flex-col flex-1 min-h-[250px] md:min-h-[300px] overflow-hidden transition-colors duration-300 relative group`}>
                      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                         <span className={`px-2 py-1 ${theme === 'dark' ? 'bg-black/60 text-slate-400' : 'bg-white/80 text-black'} backdrop-blur rounded text-[9px] font-bold border border-white/5 tracking-widest uppercase`}>{t.preview} {exportFormat.toUpperCase()}</span>
                      </div>
                      
                      <div 
                        onClick={() => {
                          setShowPreviewModal(true);
                          setPreviewZoom(1);
                          setPreviewPosition({ x: 0, y: 0 });
                        }}
                        className={`flex-1 flex items-center justify-center p-4 cursor-zoom-in rounded-lg overflow-hidden ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-slate-50'}`}
                      >
                         {previewUrl ? (
                           <img src={previewUrl} alt="Compressed Preview" className="max-w-full max-h-full object-contain rounded shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]" />
                         ) : (
                           <div className="text-slate-500 animate-pulse font-mono text-[10px] uppercase tracking-widest">{t.processing}...</div>
                         )}
                         
                         <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <Eye className="text-white drop-shadow-lg" size={32} />
                         </div>
                      </div>
                    </div>

                    {exportFormat === 'huff' && (
                      <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xl'} border rounded-xl p-6 flex flex-col h-[200px] shrink-0 overflow-hidden transition-colors duration-300`}>
                        <h3 className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-black'} mb-4`}>Bản Đồ Phân Phối</h3>
                        <div className={`flex-1 ${theme === 'dark' ? 'bg-slate-950/50 border-slate-800/50 text-indigo-400/80' : 'bg-slate-50 border-slate-300 text-indigo-700'} rounded-lg p-4 border font-mono text-[10px] overflow-y-auto custom-scrollbar`}>
                          <div className="space-y-1">
                            {Object.entries(compressionResult.codeMap).slice(0, 50).map(([key, value]) => (
                              <div key={key} className={`flex justify-between items-center py-0.5 border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-300/50'} last:border-0`}>
                                <span className="opacity-40">PIXEL 0x{parseInt(key).toString(16).toUpperCase().padStart(2, '0')}</span>
                                <ChevronRight size={10} className="opacity-20" />
                                <span className={`${theme === 'dark' ? 'text-slate-300' : 'text-black'} font-bold`}>{value}</span>
                              </div>
                            ))}
                            <div className={`pt-4 text-center ${theme === 'dark' ? 'text-slate-600' : 'text-black'} italic font-bold`}>... DỮ LIỆU ĐÃ ĐƯỢC RÚT GỌN ...</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xl'} border lg:col-span-1 xl:col-span-2 rounded-xl p-12 flex flex-col items-center justify-center text-center transition-colors duration-300 lg:min-h-[300px]`}>
                      <div className={`w-16 h-16 rounded-2xl ${theme === 'dark' ? 'bg-slate-950 border-slate-800 flex items-center justify-center text-indigo-400' : 'bg-slate-50 border-slate-300 flex items-center justify-center text-black'} mb-6`}>
                        <BarChart3 size={32} />
                      </div>
                      <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'} mb-2 text-black`}>{t.ready}</h2>
                      <p className={`max-w-xs text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-black'} leading-relaxed font-mono uppercase italic tracking-tighter font-bold`}>{t.readyDesc}</p>
                    </div>
              )}
            </motion.div>
          ) : activeTab === 'decompress' ? (
            <motion.div 
              key="decompress-zone"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col lg:grid lg:grid-cols-12 gap-8 min-h-0 w-full flex-1"
            >
              <div className="lg:col-span-4 flex flex-col gap-6 min-h-0 w-full">
                <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xl'} border rounded-xl p-6 md:p-8 space-y-8 h-fit transition-colors duration-300`}>
                  <div>
                    <h3 className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-black'} mb-4`}>{t.restoreFile}</h3>
                    <div className={`border-2 border-dashed ${theme === 'dark' ? 'border-slate-700/50 bg-slate-950/30' : 'border-slate-300 bg-slate-50'} rounded-xl p-10 flex flex-col items-center justify-center text-center hover:border-indigo-500/30 hover:bg-black/5 transition-all cursor-pointer relative group`}>
                      <input type="file" accept=".huff" onChange={handleDecompressUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      <div className={`w-14 h-14 rounded-full ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-white text-black shadow-sm'} flex items-center justify-center mb-4 group-hover:text-indigo-400 group-hover:scale-110 transition-all`}>
                        <Binary size={24} />
                      </div>
                      <p className="text-sm font-medium text-black">{t.chooseHuff}</p>
                    </div>
                  </div>

                  {decompressionResult && (
                    <div className={`space-y-6 pt-6 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-300'}`}>
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-500/10 rounded-full p-2">
                          <CheckCircle2 size={20} className="text-emerald-500" />
                        </div>
                        <h3 className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-black'}`}>{t.verified}</h3>
                      </div>
                      <div className={`space-y-3 font-mono text-[10px] ${theme === 'dark' ? 'text-slate-500' : 'text-black'} uppercase tracking-wider font-bold`}>
                        <div className="flex justify-between">
                          <span>{t.resolution}</span>
                          <span className={theme === 'dark' ? 'text-slate-300' : 'text-black'}>{decompressionResult.width} × {decompressionResult.height}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t.latency}</span>
                          <span className={theme === 'dark' ? 'text-slate-300' : 'text-black'}>{decompressionResult.duration.toFixed(2)} ms</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = decompressionResult.imageSrc;
                          a.download = `restored_${Date.now()}.png`;
                          a.click();
                        }}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs tracking-widest shadow-lg flex items-center justify-center gap-2"
                      >
                        <Download size={16} />
                        {t.saveRestored}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-8 lg:h-full min-h-0 mb-4 lg:mb-0 w-full">
                <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800 bg-grid-slate-800/5' : 'bg-white border-slate-200 bg-grid-slate-200/5'} border rounded-xl p-4 min-h-0 lg:h-full flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300 shadow-xl`}>
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`px-2 py-1 ${theme === 'dark' ? 'bg-black/60 text-slate-400' : 'bg-white/80 text-slate-500'} backdrop-blur rounded text-[9px] font-bold border border-white/5 tracking-widest uppercase`}>{t.restoreBuffer}</span>
                  </div>
                  {decompressionResult ? (
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <img src={decompressionResult.imageSrc} alt="Decoded" className="w-full h-full object-contain rounded shadow-2xl" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center opacity-20">
                      <FileImage size={64} className="mb-4" />
                      <p className="text-xs font-mono tracking-widest uppercase">{t.waitingDecode}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="upscale-zone"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col lg:grid lg:grid-cols-2 gap-8 min-h-0 w-full flex-1"
            >
              <div className="lg:col-span-1 flex flex-col gap-6 min-h-0 w-full">
                <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-xl p-6 shadow-xl flex-1 flex flex-col min-h-0 transition-colors duration-300`}>
                  <h3 className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} mb-5 shrink-0`}>{t.sourceData}</h3>
                  {!image ? (
                    <div className={`flex-1 border-2 border-dashed ${theme === 'dark' ? 'border-slate-700/50 bg-slate-950/30' : 'border-slate-200 bg-slate-50'} rounded-xl p-6 md:p-8 flex flex-col items-center justify-center text-center hover:border-indigo-500/30 hover:bg-indigo-50/10 transition-all cursor-pointer relative group min-h-0`}>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      <div className={`w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-300 shadow-sm'} flex items-center justify-center mb-4 group-hover:text-indigo-400 group-hover:scale-110 transition-all`}>
                        <Upload size={18} />
                      </div>
                      <p className="text-[12px] md:text-sm font-medium mb-1">{t.dropHint}</p>
                      <p className={`text-[9px] md:text-[10px] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} font-mono uppercase`}>{t.rasterSupport}</p>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col gap-3 md:gap-4 min-h-0">
                      <div className={`flex-1 min-h-0 ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'} rounded-lg overflow-hidden border flex items-center justify-center p-2`}>
                        <img src={image.src} alt="Preview" className="max-w-full max-h-full object-contain rounded" />
                      </div>
                      <div className="space-y-1.5 md:space-y-2 shrink-0">
                        <div className={`flex justify-between text-[10px] md:text-xs font-mono translation-all ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          <span>{t.originalSize}</span>
                          <span className={theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}>{formatSize(originalFileSize)}</span>
                        </div>
                        <div className={`flex justify-between text-[10px] md:text-xs font-mono translation-all ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          <span>{t.resolution}</span>
                          <span className={theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}>{image.width} × {image.height}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => { setImage(null); setUpscaleResult(null); }}
                        className={`w-full shrink-0 py-2 md:py-2.5 text-[10px] md:text-xs font-bold ${theme === 'dark' ? 'text-slate-400 border-slate-800 hover:bg-slate-800' : 'text-slate-500 border-slate-200 hover:bg-slate-50'} border rounded-lg transition-colors`}
                      >
                        {t.changeFile}
                      </button>
                    </div>
                  )}
                </div>

                <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-xl p-4 md:p-6 shadow-xl space-y-4 md:space-y-6 shrink-0 transition-colors duration-300`}>
                  <h3 className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} mb-2`}>{t.upscaleConfig}</h3>
                  
                  <div className="space-y-4 md:space-y-6">
                    <div className="space-y-2">
                       <span className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{t.upscaleFactor}</span>
                       <div className="flex gap-2">
                          <div className="grid grid-cols-3 gap-2 flex-1">
                            {[2, 3, 4].map((f) => (
                              <button
                                key={f}
                                onClick={() => { setUpscaleFactor(f); setCustomFactorInput(""); }}
                                className={`py-1.5 md:py-2 text-[9px] md:text-[10px] font-bold uppercase border rounded-lg transition-all ${upscaleFactor === f && !customFactorInput ? 'bg-indigo-600 border-indigo-600 text-white' : (theme === 'dark' ? 'border-slate-800 text-slate-500 hover:border-slate-700' : 'border-slate-200 text-slate-400 hover:bg-slate-50')}`}
                              >
                                {f}x
                              </button>
                            ))}
                          </div>
                          <div className="w-16 md:w-20">
                            <input 
                              type="number"
                              min="1"
                              step="0.1"
                              placeholder={t.custom}
                              value={customFactorInput}
                              onChange={(e) => {
                                setCustomFactorInput(e.target.value);
                                const val = parseFloat(e.target.value);
                                if (!isNaN(val) && val > 0) setUpscaleFactor(val);
                                else if (e.target.value === "") setUpscaleFactor(2);
                              }}
                              className={`w-full py-1.5 md:py-2 px-1 md:px-2 text-[9px] md:text-[10px] font-bold uppercase border rounded-lg text-center outline-none transition-all ${customFactorInput ? 'bg-indigo-600/10 border-indigo-600/50 text-indigo-500' : (theme === 'dark' ? 'bg-transparent border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-600')}`}
                            />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <div className="flex justify-between items-center">
                         <span className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{t.aiModel}</span>
                         {aiModelType === 'free' && (
                           <span className="text-[9px] md:text-[10px] font-mono text-emerald-500">{t.remaining}: {freeUsagesLeft}/5</span>
                         )}
                       </div>
                       <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setAiModelType('free')}
                            className={`py-1.5 md:py-2 text-[8px] md:text-[10px] items-center justify-center font-bold uppercase border rounded-lg transition-all flex flex-col ${aiModelType === 'free' ? 'bg-indigo-600 border-indigo-600 text-white' : (theme === 'dark' ? 'border-slate-800 text-slate-500 hover:border-slate-700' : 'border-slate-200 text-slate-400 hover:bg-slate-50')}`}
                          >
                            Gemini 2.5 Flash
                            <div className="text-[7px] md:text-[8px] opacity-70">({t.free})</div>
                          </button>
                          <button
                            onClick={() => setAiModelType('paid')}
                            className={`py-1.5 md:py-2 text-[8px] md:text-[10px] items-center justify-center font-bold uppercase border rounded-lg transition-all flex flex-col ${aiModelType === 'paid' ? 'bg-indigo-600 border-indigo-600 text-white' : (theme === 'dark' ? 'border-slate-800 text-slate-500 hover:border-slate-700' : 'border-slate-200 text-slate-400 hover:bg-slate-50')}`}
                          >
                            Gemini 3.1 HQ
                            <div className="text-[7px] md:text-[8px] opacity-70">({t.paid})</div>
                          </button>
                       </div>
                    </div>

                    <div className="pt-1 md:pt-2">
                      <button 
                        onClick={handleUpscale}
                        disabled={!image || isProcessing}
                        className="w-full py-3 md:py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs tracking-widest shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed group h-[48px] md:h-[52px]"
                      >
                        {isProcessing ? (
                          <RefreshCcw className="animate-spin mx-auto" size={16} />
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Maximize size={14} />
                            {t.startUpscale}
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1 flex flex-col gap-8 min-h-0 w-full">
                <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800 bg-grid-slate-800/5' : 'bg-white border-slate-300 bg-grid-slate-200/5 shadow-xl'} border rounded-xl p-4 min-h-0 flex-1 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300`}>
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`px-2 py-1 ${theme === 'dark' ? 'bg-black/60 text-slate-400' : 'bg-white/80 text-black font-black'} backdrop-blur rounded text-[9px] font-bold border border-white/5 tracking-widest uppercase`}>{t.upscaleResult}</span>
                  </div>
                  {upscaleResult ? (
                    <div className="relative group w-full h-full flex flex-col items-center justify-center p-4">
                      
                      <div className={`relative overflow-auto custom-scrollbar transition-all flex items-center justify-center rounded ${isZoomed ? 'w-full h-full cursor-zoom-out' : 'w-full h-full cursor-zoom-in overflow-hidden'}`} onClick={() => setIsZoomed(!isZoomed)}>
                         <img 
                            src={upscaleResult} 
                            alt="Upscaled" 
                            className={`transition-all duration-300 rounded shadow-2xl ${isZoomed ? 'max-w-none max-h-none' : 'w-full h-full object-contain'}`} 
                            style={{ width: isZoomed ? `${upscaleResultDimensions?.width}px` : undefined }}
                         />
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                         <div className="bg-black/80 backdrop-blur px-4 py-2 rounded-full text-xs font-bold text-white border border-white/10 flex items-center gap-2">
                           {isZoomed ? <ZoomOut size={14}/> : <ZoomIn size={14}/>}
                           <span>{isZoomed ? t.zoomOut : t.zoomIn}</span>
                         </div>
                      </div>
                      <div className="absolute bottom-4 right-4 z-10 opacity-70">
                        <span className={`px-2 py-1 ${theme === 'dark' ? 'bg-black/60 text-slate-300' : 'bg-white/80 text-black font-black'} backdrop-blur rounded text-[9px] font-bold border border-white/5 tracking-widest uppercase`}>
                          {upscaleResultDimensions ? `${upscaleResultDimensions.width} x ${upscaleResultDimensions.height} PX` : ''}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center opacity-20">
                      <Maximize size={64} className={`mb-4 ${theme === 'dark' ? '' : 'text-black'}`} />
                      <p className={`text-xs font-mono tracking-widest uppercase ${theme === 'dark' ? '' : 'text-black font-black'}`}>{t.waitingUpscale}</p>
                    </div>
                  )}
                </div>

                {upscaleResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-xl'} border rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 transition-colors duration-300`}
                  >
                    <div className="flex flex-col">
                      <span className={`text-[10px] ${theme === 'dark' ? 'text-slate-500' : 'text-black opacity-60'} uppercase tracking-widest mb-2 font-bold italic`}>{t.interpolation}</span>
                      <span className="text-xl font-light font-mono text-indigo-500 font-bold uppercase tracking-widest">GEMINI AI UPSCALING</span>
                    </div>
                    <button 
                      onClick={saveUpscaledImage}
                      className="w-full md:w-auto px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[9px] tracking-widest shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-3"
                    >
                      <Download size={18} />
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {showPreviewModal && previewUrl && (
          <div 
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/98 backdrop-blur-md p-4" 
            onWheel={(e) => {
              if (e.deltaY < 0) setPreviewZoom(prev => Math.min(prev + 0.2, 5));
              else setPreviewZoom(prev => Math.max(prev - 0.2, 0.5));
            }}
          >
            {/* Backdrop Closer */}
            <div className="absolute inset-0 z-0" onClick={() => { setShowPreviewModal(false); setPreviewZoom(1); }}></div>

            <div className="absolute top-6 right-6 z-20 flex gap-2" onClick={(e) => e.stopPropagation()}>
              <div className="bg-black/40 backdrop-blur rounded-lg border border-white/10 flex overflow-hidden">
                <button 
                  onClick={() => { setPreviewZoom(prev => Math.min(prev + 0.5, 10)); }}
                  className="p-3 text-white hover:bg-white/10 transition-colors"
                  title={t.zoomIn}
                >
                  <ZoomIn size={18} />
                </button>
                <div className="w-[1px] bg-white/10 h-6 my-auto"></div>
                <button 
                  onClick={() => { setPreviewZoom(prev => Math.max(prev - 0.5, 0.5)); }}
                  className="p-3 text-white hover:bg-white/10 transition-colors"
                  title={t.zoomOut}
                >
                  <ZoomOut size={18} />
                </button>
                <div className="w-[1px] bg-white/10 h-6 my-auto"></div>
                <button 
                  onClick={() => { setPreviewZoom(1); setPreviewPosition({x:0, y:0}); }}
                  className="p-3 text-white hover:bg-white/10 transition-colors text-[10px] font-bold uppercase tracking-tight"
                >
                  100%
                </button>
              </div>
              <button 
                onClick={() => { setShowPreviewModal(false); setPreviewZoom(1); }}
                className="w-11 h-11 rounded-lg bg-red-500 hover:bg-red-400 text-white flex items-center justify-center transition-colors shadow-lg shadow-red-500/20"
                title={t.close}
              >
                <X size={20} />
              </button>
            </div>
            
             <div 
               className="relative z-10 w-full h-full flex items-center justify-center overflow-hidden"
               onClick={(e) => e.stopPropagation()}
             >
                <motion.div
                  className="relative flex items-center justify-center"
                  style={{ width: '100%', height: '100%' }}
                >
                  <motion.img 
                    drag={previewZoom > 1.01}
                    dragConstraints={{ left: -2000 * previewZoom, right: 2000 * previewZoom, top: -2000 * previewZoom, bottom: 2000 * previewZoom }}
                    dragElastic={0}
                    dragMomentum={false}
                    onDragStart={(e) => e.preventDefault()}
                    src={previewUrl} 
                    alt="Preview compressed" 
                    animate={{ 
                      scale: previewZoom,
                      x: previewZoom === 1 ? 0 : undefined,
                      y: previewZoom === 1 ? 0 : undefined
                    }}
                    transition={{ 
                      scale: { type: "spring", damping: 30, stiffness: 300 },
                      x: { duration: 0 },
                      y: { duration: 0 },
                      default: { duration: 0 }
                    }}
                    className={`rounded shadow-2xl max-w-[95vw] max-h-[85vh] object-contain cursor-grab active:cursor-grabbing select-none ${previewZoom > 2 ? '[image-rendering:pixelated]' : ''}`}
                    style={{ touchAction: 'none' }}
                  />
                </motion.div>
             </div>
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 border border-white/10 bg-black/60 backdrop-blur rounded-full text-[10px] font-bold text-white flex items-center gap-4 pointer-events-none uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <span className="opacity-50">Zoom:</span>
                <span>{Math.round(previewZoom * 100)}%</span>
              </div>
              <div className="w-[1px] h-3 bg-white/20"></div>
              <div className="flex items-center gap-2">
                <span className="opacity-50">Size:</span>
                <span>{formatSize(compressionResult?.compressedSize || 0)}</span>
              </div>
            </div>
          </div>
        )}
      </main>



      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Error Overlay */}
      {error && (
        <div className="fixed bottom-14 left-4 right-4 md:bottom-12 md:right-12 md:left-auto z-[200]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/95 backdrop-blur-md border border-red-500/50 p-4 rounded-xl shadow-2xl flex items-center justify-between gap-3 text-white max-w-lg mx-auto md:mx-0"
          >
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-red-400 shrink-0" />
              <p className="text-xs font-bold uppercase tracking-tight">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="p-1 hover:bg-white/10 rounded transition-colors">✕</button>
          </motion.div>
        </div>
      )}
    </div>
    </>
  );
}
