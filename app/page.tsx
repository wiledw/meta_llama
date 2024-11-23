import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Paperclip } from "lucide-react";
import { WelcomeSection } from "@/components/WelcomeSection";
import { FeaturesSection } from "@/components/FeaturesSection";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 gap-12">
      <WelcomeSection />
      <FeaturesSection />
      
      {/* Bottom Input Section */}
      <section className="w-full max-w-3xl px-4 mt-auto mb-20">
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 bg-gray-300/50 p-4 rounded-lg">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="image/*"
              capture="environment"
            />
            <label 
              htmlFor="file-upload" 
              className="cursor-pointer p-2 hover:bg-gray-400 rounded-md"
            >
              <Paperclip className="h-5 w-5" />
            </label>
            <Input 
              placeholder="Where would you like to go?" 
              className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button variant="ghost">
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}