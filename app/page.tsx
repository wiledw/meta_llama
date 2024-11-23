'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Paperclip, Camera, X } from "lucide-react";
import { WelcomeSection } from "@/components/WelcomeSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>('');

  const clearForm = () => {
    setSelectedImage(null);
    setImageFile(null);
    setPrompt('');
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4.5 * 1024 * 1024) {
        alert('Image size must be less than 4.5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      setImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleSubmit = async () => {
    // Check if either image or prompt is provided (not both required)
    if (!imageFile && !prompt.trim()) {
      alert('Please provide either an image or a prompt');
      return;
    }

    console.log({
      hasImage: !!imageFile,
      imageFile,
      hasPrompt: !!prompt.trim(),
      prompt
    });
    console.log("Sending to VLM...");

    // Create FormData only with the provided data
    const formData = new FormData();
    if (imageFile) formData.append('image', imageFile);
    if (prompt.trim()) formData.append('prompt', prompt);

    // After successful submission
    clearForm();

    // try {
    //   const response = await fetch('/api/your-vlm-endpoint', {
    //     method: 'POST',
    //     body: formData,
    //   });

    //   if (!response.ok) {
    //     throw new Error('Failed to process request');
    //   }

    //   const result = await response.json();
    //   console.log('VLM Response:', result);

    // } catch (error) {
    //   console.error('Error:', error);
    //   alert('Failed to process request');
    // }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 gap-12">
      <WelcomeSection />
      <FeaturesSection />
      
      <section className="w-full max-w-3xl px-4 mt-auto mb-20">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 bg-gray-300/50 p-4 rounded-lg">
            {selectedImage && (
              <div className="flex items-center gap-2">
                <div className="relative h-20 w-20">
                  <Image 
                    src={selectedImage}
                    alt="Selected"
                    fill
                    className="object-cover rounded"
                    unoptimized
                  />
                </div>
                <button 
                  onClick={clearForm}
                  className="p-1.5 hover:bg-gray-400 rounded-full bg-gray-300"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="flex gap-4">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept="image/*"
                onChange={handleImageSelect}
              />
              
              <input
                type="file"
                id="camera-upload"
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
              />
              
              <label 
                htmlFor="file-upload" 
                className="cursor-pointer p-2 hover:bg-gray-400 rounded-md md:block"
                title="Upload Photo"
              >
                <Paperclip className="h-5 w-5" />
              </label>

              <label 
                htmlFor="camera-upload" 
                className="cursor-pointer p-2 hover:bg-gray-400 rounded-md md:hidden"
                title="Take Photo"
              >
                <Camera className="h-5 w-5" />
              </label>

              <Input 
                placeholder="Where would you like to go?" 
                className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />

              <Button 
                variant="ghost" 
                onClick={handleSubmit}
                disabled={!imageFile && !prompt.trim()}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}