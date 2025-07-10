
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Heart, Rocket } from "lucide-react";

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClick = () => {
    setClickCount(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <Card className="p-8 md:p-12 max-w-2xl w-full text-center shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <div className="space-y-6">
            {/* Main greeting */}
            <div className="space-y-4">
              <div className="flex justify-center">
                <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Hello, World! 👋
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 font-medium">
                Welcome to your beautiful new app
              </p>
            </div>

            {/* Description */}
            <div className="space-y-4 py-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                This is where your amazing journey begins. Every great application starts with a simple greeting.
              </p>
              <div className="flex justify-center items-center space-x-2 text-gray-600">
                <span>Built with</span>
                <Heart className="w-5 h-5 text-red-500 animate-bounce" />
                <span>and modern web technologies</span>
              </div>
            </div>

            {/* Interactive section */}
            <div className="space-y-4">
              <Button 
                onClick={handleClick}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Get Started
              </Button>
              
              {clickCount > 0 && (
                <div className={`transform transition-all duration-500 ${clickCount > 0 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                  <p className="text-sm text-gray-600">
                    Button clicked {clickCount} time{clickCount !== 1 ? 's' : ''}! 🎉
                  </p>
                </div>
              )}
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-md transition-shadow duration-200">
                <h3 className="font-semibold text-blue-800 mb-2">Responsive</h3>
                <p className="text-sm text-blue-600">Looks great on all devices</p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-md transition-shadow duration-200">
                <h3 className="font-semibold text-purple-800 mb-2">Modern</h3>
                <p className="text-sm text-purple-600">Built with latest technologies</p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-pink-50 to-pink-100 hover:shadow-md transition-shadow duration-200">
                <h3 className="font-semibold text-pink-800 mb-2">Beautiful</h3>
                <p className="text-sm text-pink-600">Carefully crafted design</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
