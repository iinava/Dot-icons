"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { 
  Moon,
  Sun,
  Upload,
  Download,
  Settings2,
  Grid3X3,
  Image as ImageIcon,
  MousePointerSquareDashed,
  Play,
  Pause,
  Activity,
  Waves,
  CircleDashed,
  Wind
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const TARGET_SIZE = 600;
const SHAPE_COLOR = "rgb(255, 255, 255)";
const SHAPE_COLOR_BLACK = "rgb(0, 0, 0)";
const ASCII_CELL = 12;
const ASCII_RAMP = "@#S08Xox+=;:-,. ";

const hexToRgb = (hex: string) => {
  const bigint = parseInt(hex.replace('#', ''), 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
};

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);
  
  const [subjectScaleInput, setSubjectScaleInput] = useState(0.85);
  const [dotIntensityInput, setDotIntensityInput] = useState(1.0);
  const [gridSpacingInput, setGridSpacingInput] = useState(18);
  const [bgColorInput, setBgColorInput] = useState<string>("#2449D1");
  
  const [subjectScale, setSubjectScale] = useState(0.85);
  const [dotIntensity, setDotIntensity] = useState(1.0);
  const [gridSpacing, setGridSpacing] = useState(18);
  const [bgColor, setBgColor] = useState<string>("#2449D1");
  
  const [variation, setVariation] = useState<1 | 2 | 3>(1);
  const [asciiPattern, setAsciiPattern] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'generator' | 'gallery'>('generator');

  const [isAnimating, setIsAnimating] = useState(false);
  const [animationEffect, setAnimationEffect] = useState<'pulse' | 'ripple' | 'morph' | 'wind'>('pulse');
  const [exportingGif, setExportingGif] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const shapes = [
    "heart", "star", "circle", "shield", 
    "triangle", "diamond", "hexagon", "cross", 
    "moon", "square", "play", "pause",
    "heart", "star", "circle", "shield", 
    "triangle", "diamond", "hexagon", "cross", 
    "moon", "square", "play", "pause"
  ];

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|; )theme=([^;]*)/);
      if (match && (match[1] === 'light' || match[1] === 'dark')) {
        setTheme(match[1] as 'dark' | 'light');
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.cookie = `theme=${theme}; path=/; max-age=31536000`;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, mounted]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setSubjectScale(subjectScaleInput);
      setDotIntensity(dotIntensityInput);
      setGridSpacing(gridSpacingInput);
      setBgColor(bgColorInput);
    }, 150); 
    return () => clearTimeout(timerId);
  }, [subjectScaleInput, dotIntensityInput, gridSpacingInput, bgColorInput]);

  const getAsciiColor = (hex: string) => {
    const [r, g, b] = hexToRgb(hex);
    return `rgb(${Math.min(255, r + 34)}, ${Math.min(255, g + 32)}, ${Math.min(255, b + 21)})`;
  };

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = TARGET_SIZE;
    canvas.height = TARGET_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);
    ctx.font = `bold ${ASCII_CELL}px monospace`;
    ctx.fillStyle = getAsciiColor(bgColor);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    for (let yBg = 0; yBg < TARGET_SIZE; yBg += ASCII_CELL) {
      for (let xBg = 0; xBg < TARGET_SIZE; xBg += ASCII_CELL) {
        const randChar = ASCII_RAMP[Math.floor(Math.random() * ASCII_RAMP.length)];
        ctx.fillText(randChar, xBg, yBg);
      }
    }
    setAsciiPattern(canvas.toDataURL("image/png"));
  }, [bgColor]);

  useEffect(() => {
    if (uploadedImage && !isAnimating) {
      generateDotArt(uploadedImage);
    }
  }, [subjectScale, dotIntensity, gridSpacing, uploadedImage, variation, bgColor, isAnimating]);

  useEffect(() => {
    if (isAnimating && uploadedImage && imageRef.current) {
      const startTime = performance.now();
      const animate = (time: number) => {
        const elapsed = (time - startTime) / 1000;
        renderFrame(elapsed, imageRef.current!);
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationRef.current);
    }
  }, [isAnimating, uploadedImage, subjectScale, dotIntensity, gridSpacing, variation, bgColor, animationEffect]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setUploadedImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateDotArt = (imageSrc: string) => {
    setIsGenerating(true);
    const img = new window.Image();
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      renderFrame(0, img);
      setIsGenerating(false);
    };
  };

  const renderFrame = (time: number, img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = TARGET_SIZE;
    canvas.height = TARGET_SIZE;

    const offCanvas = document.createElement('canvas');
    offCanvas.width = TARGET_SIZE;
    offCanvas.height = TARGET_SIZE;
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return;

    Object.assign(offCtx, { fillStyle: 'white' });
    offCtx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);
    
    const baseScale = Math.min(TARGET_SIZE / img.width, TARGET_SIZE / img.height);
    const w = img.width * baseScale * subjectScale;
    const h = img.height * baseScale * subjectScale;
    const x = (TARGET_SIZE - w) / 2;
    const y = (TARGET_SIZE - h) / 2;
    offCtx.drawImage(img, x, y, w, h);
    
    const imgData = offCtx.getImageData(0, 0, TARGET_SIZE, TARGET_SIZE).data;

    ctx.clearRect(0, 0, TARGET_SIZE, TARGET_SIZE);

    if (variation === 1) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);
      
      ctx.font = `bold ${ASCII_CELL}px monospace`;
      ctx.fillStyle = getAsciiColor(bgColor);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      for (let yBg = 0; yBg < TARGET_SIZE; yBg += ASCII_CELL) {
        for (let xBg = 0; xBg < TARGET_SIZE; xBg += ASCII_CELL) {
          if (isAnimating) {
            // Predictable blocky noise that updates 8 times a loop to give a generic random-swapping effect
            const seed = Math.floor(time * 8); 
            const noise = Math.sin(xBg * 12.9898 + yBg * 78.233 + seed) * 43758.5453;
            const charIndex = Math.floor(Math.abs(noise)) % ASCII_RAMP.length;
            ctx.fillText(ASCII_RAMP[charIndex], xBg, yBg);
          } else {
            const randChar = ASCII_RAMP[Math.floor(Math.random() * ASCII_RAMP.length)];
            ctx.fillText(randChar, xBg, yBg);
          }
        }
      }
    }

    const maxRadius = Math.max(1, gridSpacing * 0.44);
    const minRadius = Math.max(0.2, gridSpacing * 0.11);

    ctx.fillStyle = variation === 3 ? SHAPE_COLOR_BLACK : SHAPE_COLOR;
    for (let gy = 0; gy < TARGET_SIZE; gy += gridSpacing) {
      for (let gx = 0; gx < TARGET_SIZE; gx += gridSpacing) {
        let rSum = 0, gSum = 0, bSum = 0;
        let count = 0;
        
        for (let py = gy; py < gy + gridSpacing && py < TARGET_SIZE; py++) {
          for (let px = gx; px < gx + gridSpacing && px < TARGET_SIZE; px++) {
            const idx = (py * TARGET_SIZE + px) * 4;
            rSum += imgData[idx];
            gSum += imgData[idx+1];
            bSum += imgData[idx+2];
            count++;
          }
        }
        
        const avg = (rSum + gSum + bSum) / (3 * count);
        const lum = avg / 255;
        let invLum = 1 - lum; 

        invLum = Math.max(0, Math.min(1, invLum * dotIntensity));
        
        let radius = minRadius + invLum * (maxRadius - minRadius);
        radius = Math.max(minRadius, Math.min(maxRadius, radius));
        
        if (isAnimating) {
           if (animationEffect === 'pulse') {
             const pulse = Math.sin(time * Math.PI + (gx + gy) * 0.01) * 0.2 + 0.8;
             radius = Math.max(minRadius, Math.min(maxRadius * 1.2, radius * pulse));
           } else if (animationEffect === 'ripple') {
             const dist = Math.sqrt(Math.pow(gx - TARGET_SIZE/2, 2) + Math.pow(gy - TARGET_SIZE/2, 2));
             const ripple = Math.sin(dist * 0.02 - time * Math.PI) * 0.2 + 0.8;
             radius = Math.max(minRadius, Math.min(maxRadius * 1.2, radius * ripple));
           } 
           // For morph, we keep the original radius to avoid 'pulsing' the size, 
           // and instead purely transform the shape geometry below.
        }

        if (radius > 0.5 && invLum > 0.05) {
          const cx = gx + gridSpacing / 2;
          const cy = gy + gridSpacing / 2;
          
          ctx.beginPath();
          if (isAnimating && animationEffect === 'morph') {
             // 3D Flip/Louver effect - horizontally scales the shape to emulate 3D rotation
             const flipProgress = time * Math.PI + (gx - gy) * 0.015;
             const flipScale = Math.cos(flipProgress); 
             
             ctx.translate(cx, cy);
             const safeScale = flipScale === 0 ? 0.001 : flipScale;
             ctx.scale(safeScale, 1);
             
             const isCircle = (gx + gy) % (gridSpacing * 2) === 0;
             if (isCircle) {
               ctx.arc(0, 0, radius, 0, Math.PI * 2);
             } else {
               ctx.rect(-radius, -radius, radius * 2, radius * 2);
             }
             
             ctx.scale(1 / safeScale, 1);
             ctx.translate(-cx, -cy);
          } else {
             let drawCx = cx;
             let drawCy = cy;
             
             if (isAnimating && animationEffect === 'wind') {
                const windProgress = time * Math.PI + (gx + gy) * 0.015;
                const maxWind = gridSpacing * 0.35; 
                drawCx += Math.cos(windProgress) * maxWind;
                drawCy += Math.sin(windProgress) * maxWind;
             }
             
             const isCircle = (gx + gy) % (gridSpacing * 2) === 0;
             if (isCircle) {
               ctx.arc(drawCx, drawCy, radius, 0, Math.PI * 2);
             } else {
               ctx.rect(drawCx - radius, drawCy - radius, radius * 2, radius * 2);
             }
          }
          ctx.fill();
        }
      }
    }
  };

  const handleExport = async () => {
    if (isAnimating && imageRef.current) {
      setExportingGif(true);
      const { GIFEncoder, quantize, applyPalette } = await import('gifenc');
      const gif = GIFEncoder();
      
      const fps = 15;
      const duration = 2; // 2 seconds for a perfect loop
      const frames = fps * duration;
      const delay = Math.round(1000 / fps);
      
      for (let i = 0; i < frames; i++) {
        // Match exact virtual time to frame index to perfectly match the preview clock
        const time = (i / frames) * duration; 
        renderFrame(time, imageRef.current);
        
        const canvas = canvasRef.current;
        if (!canvas) continue;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        
        const imageData = ctx.getImageData(0, 0, TARGET_SIZE, TARGET_SIZE);
        const data = imageData.data;
        
        const palette = quantize(data, 256, { format: 'rgba4444' });
        const index = applyPalette(data, palette, 'rgba4444');
        
        gif.writeFrame(index, TARGET_SIZE, TARGET_SIZE, { palette, delay });
      }
      
      gif.finish();
      const buffer = gif.bytes();
      const blob = new Blob([buffer], { type: 'image/gif' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.download = "animated_dot_icon.gif";
      link.href = url;
      link.click();
      
      URL.revokeObjectURL(url);
      setExportingGif(false);
      
      if (document.timeline) {
         renderFrame(performance.now() / 1000, imageRef.current);
      }
    } else {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = variation === 1 ? "custom_dot_icon.png" : "custom_dot_icon_transparent.png";
      link.href = dataUrl;
      link.click();
    }
  };

  const handleGridDownload = async (e: React.MouseEvent, s: string) => {
    e.preventDefault();
    if (variation === 1) {
      const canvas = document.createElement("canvas");
      canvas.width = TARGET_SIZE;
      canvas.height = TARGET_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);
      
      if (asciiPattern) {
        const patternImg = new window.Image();
        patternImg.src = asciiPattern;
        await new Promise((resolve) => { patternImg.onload = resolve; });
        ctx.drawImage(patternImg, 0, 0, TARGET_SIZE, TARGET_SIZE);
      }

      const maskImg = new window.Image();
      maskImg.src = `/icons/${s}_v2.png`;
      await new Promise((resolve) => { maskImg.onload = resolve; });
      ctx.drawImage(maskImg, 0, 0, TARGET_SIZE, TARGET_SIZE);
      
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${s}_dotart_v1.png`;
      link.href = dataUrl;
      link.click();
    } else {
      const fileSrc = variation === 3 ? `/icons/${s}_v3.png` : `/icons/${s}_v2.png`;
      const link = document.createElement("a");
      link.download = `${s}_dotart_v${variation}.png`;
      link.href = fileSrc;
      link.click();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans transition-colors duration-300 overflow-hidden">
      
      {/* 1. GLOBAL NAVBAR */}
      <header className="z-50 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 lg:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-foreground text-background font-bold shrink-0">
            <MousePointerSquareDashed className="w-5 h-5" />
          </div>
          <span className="font-mono text-xl lg:text-2xl font-black tracking-tighter uppercase hidden sm:inline-block">
            DOTICON
          </span>
          <span className="hidden lg:flex text-[10px] text-muted-foreground font-mono ml-4 uppercase tracking-widest border border-border px-2 py-0.5 rounded-sm bg-muted/30">Beta 0.2</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-muted-foreground mr-4">
             <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
             Engine Online
          </div>
          
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
             {[1,2,3].map(v => (
               <button 
                 key={v}
                 onClick={() => setVariation(v as 1|2|3)}
                 className={`w-7 h-7 flex items-center justify-center text-xs font-mono rounded-md transition-colors ${variation === v ? 'bg-background text-foreground shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:bg-muted'}`}
               >
                 v{v}
               </button>
             ))}
          </div>

          <button 
             onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
             className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
          >
            {mounted ? (theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />) : <Sun className="w-4 h-4 opacity-0" />}
          </button>
        </div>
      </header>

      {/* 2. APP BODY CONTEXT */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden relative">
        
        {/* LEFT COMPONENT: SIDEBAR CONTROLS */}
        <nav className={`w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-border bg-muted/10 shrink-0 lg:h-full overflow-y-auto flex flex-col hide-scrollbar transition-all duration-300 z-10 ${activeTab === 'gallery' ? 'hidden lg:flex' : 'flex'}`}>
           <div className="p-4 lg:p-6 flex flex-col gap-8 pb-12">
             
             {/* Upload Module */}
             <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold tracking-tight">Image Source</h3>
                </div>
                <Label className="w-full bg-background hover:bg-muted/50 border border-border border-dashed text-xs text-center py-8 rounded-xl cursor-pointer transition-colors block text-muted-foreground flex flex-col items-center justify-center relative shadow-sm group">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <ImageIcon className="w-5 h-5 text-foreground/70" />
                  </div>
                  <span className="font-medium text-foreground">Click to upload</span>
                  <span className="text-[10px] mt-1 opacity-70">PNG, JPG or WebP</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </Label>
                
                <Button 
                  onClick={handleExport}
                  disabled={!uploadedImage || isGenerating || exportingGif}
                  className="w-full h-10 shadow-sm"
                >
                  <Download className="w-4 h-4 mr-2" /> {exportingGif ? "Encoding GIF..." : isAnimating ? "Export GIF" : "Export Render"}
                </Button>
             </div>

             <Accordion type="single" collapsible defaultValue="parameters" className="w-full">
               {/* Engine Tuning Module */}
               <AccordionItem value="parameters" className="border-b-0 border-t border-border/50">
                 <AccordionTrigger className="hover:no-underline py-4 text-sm font-semibold tracking-tight">
                   <div className="flex items-center gap-2">
                     <Settings2 className="w-4 h-4 text-primary" />
                     Engine Parameters
                   </div>
                 </AccordionTrigger>
                 <AccordionContent>
                   <div className="space-y-6 pt-2 pb-4">
                     <div className="space-y-4">
                       <div className="flex justify-between items-center text-xs">
                         <Label className="text-muted-foreground">Grid Density</Label>
                         <span className="font-mono text-[10px] bg-muted px-2 py-0.5 rounded-md border border-border">{gridSpacingInput}px</span>
                       </div>
                       <Slider min={4} max={36} step={2} value={[gridSpacingInput]} onValueChange={val => setGridSpacingInput(val[0])} />
                     </div>

                     <div className="space-y-4">
                       <div className="flex justify-between items-center text-xs">
                         <Label className="text-muted-foreground">Subject Scale</Label>
                         <span className="font-mono text-[10px] bg-muted px-2 py-0.5 rounded-md border border-border">{subjectScaleInput.toFixed(2)}x</span>
                       </div>
                       <Slider min={0.2} max={1.5} step={0.05} value={[subjectScaleInput]} onValueChange={val => setSubjectScaleInput(val[0])} />
                     </div>

                     <div className="space-y-4">
                       <div className="flex justify-between items-center text-xs">
                         <Label className="text-muted-foreground">Dot Exposure</Label>
                         <span className="font-mono text-[10px] bg-muted px-2 py-0.5 rounded-md border border-border">{dotIntensityInput.toFixed(2)}x</span>
                       </div>
                       <Slider min={0.1} max={3.0} step={0.1} value={[dotIntensityInput]} onValueChange={val => setDotIntensityInput(val[0])} />
                     </div>

                     {/* Background Color Picker for V1 */}
                     {variation === 1 && (
                       <div className="space-y-3 pt-2">
                         <div className="flex justify-between items-center text-xs">
                           <Label className="text-muted-foreground">Matrix Color</Label>
                           <span className="font-mono text-[10px] bg-muted px-2 py-0.5 rounded-md border border-border uppercase">{bgColorInput}</span>
                         </div>
                         <input 
                           type="color" 
                           value={bgColorInput}
                           onChange={e => setBgColorInput(e.target.value)}
                           className="w-full h-10 rounded-lg cursor-pointer bg-transparent shadow-sm border border-border"
                         />
                       </div>
                     )}
                   </div>
                 </AccordionContent>
               </AccordionItem>
               
               {/* Animation Module */}
               <AccordionItem value="animate" className="border-b-0 border-t border-border/50">
                 <AccordionTrigger className="hover:no-underline py-4 text-sm font-semibold tracking-tight">
                   <div className="flex items-center gap-2">
                     <Activity className="w-4 h-4 text-primary" />
                     Animate Engine
                   </div>
                 </AccordionTrigger>
                 <AccordionContent>
                   <div className="space-y-6 pt-2 pb-4">
                     <div className="flex items-center justify-between">
                       <Label className="text-muted-foreground">Animation</Label>
                       <Button 
                         variant={isAnimating ? "default" : "outline"} 
                         size="sm" 
                         onClick={() => setIsAnimating(!isAnimating)}
                         className="h-7 text-xs"
                       >
                         {isAnimating ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                         {isAnimating ? "On" : "Off"}
                       </Button>
                     </div>
                     <div className="space-y-3">
                       <Label className="text-muted-foreground text-xs">Effect Type</Label>
                       <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                         <Button
                           variant={animationEffect === 'pulse' ? 'default' : 'outline'}
                           size="sm"
                           onClick={() => setAnimationEffect('pulse')}
                           className="h-8 text-[10px] px-1"
                         >
                           <Activity className="w-3 h-3 mr-1" /> Pulse
                         </Button>
                         <Button
                           variant={animationEffect === 'ripple' ? 'default' : 'outline'}
                           size="sm"
                           onClick={() => setAnimationEffect('ripple')}
                           className="h-8 text-[10px] px-1"
                         >
                           <Waves className="w-3 h-3 mr-1" /> Ripple
                         </Button>
                         <Button
                           variant={animationEffect === 'morph' ? 'default' : 'outline'}
                           size="sm"
                           onClick={() => setAnimationEffect('morph')}
                           className="h-8 text-[10px] px-1"
                         >
                           <CircleDashed className="w-3 h-3 mr-1" /> Morph
                         </Button>
                         <Button
                           variant={animationEffect === 'wind' ? 'default' : 'outline'}
                           size="sm"
                           onClick={() => setAnimationEffect('wind')}
                           className="h-8 text-[10px] px-1"
                         >
                           <Wind className="w-3 h-3 mr-1" /> Wind
                         </Button>
                       </div>
                     </div>
                   </div>
                 </AccordionContent>
               </AccordionItem>
             </Accordion>

             {/* Quick Preload Presets */}
             <div className="space-y-4 pt-6 border-t border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Grid3X3 className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold tracking-tight">Quick Load Mask</h3>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {shapes.slice(0, 8).map((s, i) => {
                    const inlineStyle = variation === 1 && asciiPattern ? { backgroundImage: `url(${asciiPattern})`, backgroundSize: 'cover' } : {};
                    const thumbMaskSrc = variation === 3 ? `/icons/${s}_v3.png` : `/icons/${s}_v2.png`;
                    return (
                      <button 
                        key={i} 
                        onClick={() => setUploadedImage(`/icons/${s}_base.png`)}
                        className={`aspect-square rounded-md border border-border hover:border-primary/50 transition-all p-0.5 overflow-hidden shadow-sm group ${variation === 3 ? 'bg-white' : 'bg-zinc-950'}`}
                        title={`Generate ${s}`}
                      >
                        <div className="w-full h-full relative rounded-sm overflow-hidden" style={inlineStyle}>
                          <Image src={thumbMaskSrc} alt={s} fill className="object-cover group-hover:scale-110 transition-transform duration-300" unoptimized />
                        </div>
                      </button>
                    );
                  })}
                </div>
             </div>

           </div>
        </nav>

        {/* RIGHT COMPONENT: MAIN WORKSPACE */}
        <main className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden relative">
          
          {/* Workspace Tab Switcher */}
          <div className="flex items-center px-4 lg:px-8 h-12 lg:h-14 border-b border-border bg-background/50 shrink-0 gap-6 lg:gap-8 backdrop-blur z-20">
            <button 
              onClick={() => setActiveTab('generator')} 
              className={`text-sm tracking-wide h-full border-b-2 transition-all flex items-center gap-2 px-1 ${activeTab === 'generator' ? 'border-primary text-foreground font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground font-medium'}`}
            >
              <MousePointerSquareDashed className={`w-4 h-4 ${activeTab === 'generator' ? 'text-primary' : 'opacity-70'}`} />
              Workspace
            </button>
            <button 
              onClick={() => setActiveTab('gallery')} 
              className={`text-sm tracking-wide h-full border-b-2 transition-all flex items-center gap-2 px-1 ${activeTab === 'gallery' ? 'border-primary text-foreground font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground font-medium'}`}
            >
              <Grid3X3 className={`w-4 h-4 ${activeTab === 'gallery' ? 'text-primary' : 'opacity-70'}`} />
              Gallery
            </button>
          </div>

          {/* Scrolling Content Area */}
          <div className={`flex-1 overflow-y-auto w-full relative bg-muted/10 flex flex-col items-center ${activeTab === 'generator' ? 'justify-start lg:justify-center' : 'justify-start'}`}>
            
            {/* GENERATOR TAB */}
            <div className={`w-full max-w-full h-full flex items-center justify-center p-4 sm:p-8 lg:p-12 ${activeTab === 'generator' ? 'flex' : 'hidden'} transition-all duration-300`}>
               {/* Generative Canvas Container */}
               <div className={`w-full aspect-square rounded-2xl border border-border bg-background shadow-xl flex items-center justify-center p-4 sm:p-8 lg:p-16 relative overflow-hidden transition-colors duration-500 ring-1 ring-border/20 ${variation === 3 ? 'bg-gray-100 dark:bg-white' : 'bg-gray-100 dark:bg-background'}`}
                    style={{ maxHeight: 'calc(100vh - 12rem)', maxWidth: 'calc(100vh - 12rem)', aspectRatio: '1 / 1' }}>
                  
                  {/* The actual Canvas renderer */}
                  <canvas 
                    ref={canvasRef} 
                    className={`w-full h-full object-contain pointer-events-none drop-shadow-2xl z-10 transition-opacity duration-300 ${uploadedImage ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                  />
                  
                  {/* Empty State */}
                  {!uploadedImage && (
                    <div className="absolute inset-0 m-4 sm:m-8 lg:m-12 border-2 border-dashed border-border/60 rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/20 backdrop-blur-sm z-0">
                      <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center shadow-sm mb-4">
                         <Upload className="w-6 h-6 text-primary" />
                      </div>
                      <p className="font-mono text-xs sm:text-sm tracking-wider text-center px-8 uppercase font-medium">Ready for input target</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-2 max-w-[200px] text-center">Drag image or select quick load mask from sidebar</p>
                    </div>
                  )}

                  {/* Badges / HUD */}
                  <div className="absolute top-4 sm:top-6 left-4 sm:left-6 flex flex-col gap-2 z-20 items-start">
                     <div className="flex items-center gap-2 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border shadow-sm">
                       <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                       <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-foreground">Live Render</span>
                     </div>
                     {(isGenerating || exportingGif) && (
                       <div className="flex items-center gap-2 bg-blue-500/10 text-blue-500 px-3 py-1.5 rounded-lg border border-blue-500/20 shadow-sm ml-0 animate-in fade-in slide-in-from-left-2">
                         <span className="font-mono text-[10px] font-bold tracking-widest uppercase">{exportingGif ? "Encoding GIF..." : "Processing Raster..."}</span>
                       </div>
                     )}
                  </div>
               </div>
            </div>

            {/* GALLERY TAB */}
            <div className={`w-full min-h-full p-4 lg:p-8 ${activeTab === 'gallery' ? 'block animate-in fade-in slide-in-from-bottom-4 duration-500' : 'hidden'}`}>
               <div className="mb-6 flex items-center justify-between">
                 <div>
                   <h2 className="text-xl font-bold tracking-tight">Render Storage</h2>
                   <p className="text-sm text-muted-foreground">Showing {shapes.length} pre-generated variation assets.</p>
                 </div>
               </div>

               <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6 pb-20">
                 {shapes.map((s, idx) => {
                   const maskSrc = variation === 3 ? `/icons/${s}_v3.png` : `/icons/${s}_v2.png`;
                   const inlineStyle = variation === 1 && asciiPattern ? { backgroundImage: `url(${asciiPattern})`, backgroundSize: 'contain' } : {};
                   const containerClass = variation === 3 ? 'bg-white' : 'bg-background';

                   return (
                     <div key={idx} className="group flex flex-col gap-2">
                       <a 
                         href="#"
                         onClick={(e) => handleGridDownload(e, s)}
                         className={`aspect-square rounded-xl border border-border flex flex-col items-center justify-center p-6 relative transition-all duration-300 shadow-sm hover:shadow-md hover:ring-2 ring-primary/20 ${containerClass}`}
                         style={inlineStyle}
                         title={`Download ${s}`}
                       >
                         <Image 
                           src={maskSrc} 
                           alt={s}
                           width={400}
                           height={400}
                           className="w-full h-full object-contain pointer-events-none group-hover:scale-105 transition-transform duration-500"
                           unoptimized
                         />
                         <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                           <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg text-primary-foreground mb-2 transform translate-y-2 group-hover:translate-y-0 transition-all">
                              <Download className="w-4 h-4" />
                           </div>
                           <span className="text-[10px] font-bold uppercase tracking-widest text-foreground font-mono">Download</span>
                         </div>
                       </a>
                       <div className="text-[10px] text-muted-foreground font-mono px-1 flex justify-between items-center">
                          <span className="uppercase">{s}_v{variation}</span>
                          <span className="opacity-50">PNG</span>
                       </div>
                     </div>
                   );
                 })}
               </div>
            </div>

          </div>
        </main>

      </div>
    </div>
  );
}
