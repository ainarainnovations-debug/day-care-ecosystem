import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pen, Type, Upload, RotateCcw } from 'lucide-react';

type Props = {
  signature: string;
  onSignatureChange: (signature: string) => void;
};

export default function MobileSignaturePad({ signature, onSignatureChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [typedName, setTypedName] = useState('');
  const [signatureMethod, setSignatureMethod] = useState<'draw' | 'type' | 'upload'>('draw');

  useEffect(() => {
    if (signature && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = signature;
      }
    }
  }, [signature]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    saveSignature();
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    onSignatureChange(dataUrl);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onSignatureChange('');
  };

  const generateTypedSignature = () => {
    if (!typedName.trim()) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw typed name in cursive font
    ctx.font = '48px "Brush Script MT", cursive';
    ctx.fillStyle = '#000';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedName, 20, canvas.height / 2);

    saveSignature();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear and draw uploaded image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Scale image to fit canvas
        const scale = Math.min(
          canvas.width / img.width,
          canvas.height / img.height
        );
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;

        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        saveSignature();
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <Tabs value={signatureMethod} onValueChange={(v) => setSignatureMethod(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="draw">
            <Pen className="w-4 h-4 mr-2" />
            Draw
          </TabsTrigger>
          <TabsTrigger value="type">
            <Type className="w-4 h-4 mr-2" />
            Type
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="draw" className="space-y-4">
          <Card className="p-4 bg-white border-2 border-gray-300">
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="w-full h-48 bg-white cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </Card>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Sign with your finger or mouse
            </p>
            <Button variant="outline" size="sm" onClick={clearSignature}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="type" className="space-y-4">
          <div>
            <Label htmlFor="typedName">Type your full name</Label>
            <Input
              id="typedName"
              placeholder="John Doe"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              className="mt-2"
            />
          </div>
          <Card className="p-4 bg-white border-2 border-gray-300">
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="w-full h-48 bg-white"
            />
          </Card>
          <Button onClick={generateTypedSignature} disabled={!typedName.trim()}>
            Generate Signature
          </Button>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card className="p-4 bg-white border-2 border-gray-300">
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="w-full h-48 bg-white"
            />
          </Card>
          <div>
            <Label htmlFor="signatureUpload">Upload signature image</Label>
            <Input
              id="signatureUpload"
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleImageUpload}
              className="mt-2"
            />
            <p className="text-sm text-gray-600 mt-1">
              Upload a scanned signature (PNG or JPEG)
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {signature && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-700">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="font-medium">Signature captured</span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            Your signature has been saved and will be included with your submission
          </p>
        </div>
      )}
    </div>
  );
}
