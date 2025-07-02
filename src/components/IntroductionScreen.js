// src/components/IntroductionScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import { useFoodSharingContext } from '../hooks/useFoodSharing';

const IntroductionScreen = ({ onComplete }) => {
  const { setCurrentView } = useFoodSharingContext();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const totalSlides = 3; // Hardcoding based on the minimalist slides below
  const slideIntervalRef = useRef(null);
  const carouselRef = useRef(null); // Ref for swipe events

  // Minimalist Slide definitions
  const slides = [
    // Slide 1: Welcome (Focus: Core App Purpose)
    {
      id: 'welcome',
      title: 'FoodShare',
      tagline: 'Connect. Share. Sustain.',
      icon: <Heart className="w-32 h-32 sm:w-40 sm:h-40 text-green-500 fill-current animate-beat" />,
      image: null, // Using icon for this slide
      imageAlt: 'Heart icon symbolizing caring and sharing',
      background: 'bg-gradient-to-br from-green-50 to-emerald-50',
      buttonText: 'Next',
    },
    // Slide 2: How It Works (Focus: Simplicity of Process)
    {
      id: 'process',
      title: 'Effortless Sharing',
      tagline: 'Simple steps to make an impact.',
      icon: null, // Using image for this slide
      image: 'https://images.unsplash.com/vector-1744813462575-561a49a24d14?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTI1fHxpbGx1c3RyYXRpb24lMjBvZiUyMGElMjBzaW1wbGlmaWVkJTIwcHJvY2VzcyUyMGZsb3clMjB3aXRoJTIwYXJyb3dzJTIwb2YlMjBmb29kfGVufDB8fDB8fHwy',
      imageAlt: 'Illustration of a simplified process flow with arrows',
      background: 'bg-gradient-to-br from-white to-gray-50',
      buttonText: 'Next',
    },
    // Slide 3: Impact (Focus: Benefit)
    {
      id: 'impact',
      title: 'Together, We Thrive',
      tagline: 'Reduce waste. Empower communities.',
      icon: null, // Using image for this slide
      image: 'https://images.unsplash.com/vector-1748298828860-16eff573e619?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTAxfHxpbGx1c3RyYXRpb24lMjBvZiUyMGElMjBncmVlbiUyMGVhcnRoJTIwYW5kJTIwaGVscGluZyUyMGhhbmRzfGVufDB8fDB8fHwy/',
      imageAlt: 'Illustration of a green earth and helping hands',
      background: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      buttonText: 'Get Started!',
    },
  ];

  const goToNextSlide = useCallback(() => {
    setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % totalSlides);
    // On the last slide, immediately transition to the next state without waiting for another auto-advance
    if (currentSlideIndex === totalSlides - 1) {
      clearInterval(slideIntervalRef.current);
      setCurrentView('login');
      onComplete();
    }
  }, [currentSlideIndex, totalSlides, setCurrentView, onComplete]);

  const goToPrevSlide = useCallback(() => {
    setCurrentSlideIndex((prevIndex) => (prevIndex - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const handleDotClick = useCallback((index) => {
    setCurrentSlideIndex(index);
  }, []);

  // Swipe functionality (basic implementation)
  useEffect(() => {
    const carouselElement = carouselRef.current;
    if (!carouselElement) return;

    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      clearInterval(slideIntervalRef.current); // Pause auto-slide on touch
    };

    const handleTouchMove = (e) => {
      touchEndX = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      const sensitivity = 50; // Reduced sensitivity for smoother feel on mobile
      if (touchStartX - touchEndX > sensitivity) { // Swiped left
        goToNextSlide();
      }
      if (touchStartX - touchEndX < -sensitivity) { // Swiped right
        goToPrevSlide();
      }
    };

    carouselElement.addEventListener('touchstart', handleTouchStart);
    carouselElement.addEventListener('touchmove', handleTouchMove);
    carouselElement.addEventListener('touchend', handleTouchEnd);

    return () => {
      carouselElement.removeEventListener('touchstart', handleTouchStart);
      carouselElement.removeEventListener('touchmove', handleTouchMove);
      carouselElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [goToNextSlide, goToPrevSlide]);


  const currentSlide = slides[currentSlideIndex];

  const handlePrimaryButtonClick = () => {
    if (currentSlideIndex < totalSlides - 1) {
      goToNextSlide();
    } else {
      setCurrentView('login');
      onComplete();
    }
  };

  return (
    <div className="h-screen flex flex-col font-inter text-gray-800 antialiased relative overflow-hidden">
      {/* Main Carousel Container (fills screen, handles swipe) */}
      <div ref={carouselRef} className="flex-grow relative overflow-hidden">
        <div
          className="flex h-full transition-transform duration-700 ease-in-out" // Smoother, faster transition
          style={{
            width: `${totalSlides * 100}%`,
            transform: `translateX(-${(currentSlideIndex * 100) / totalSlides}%)`
          }}
        >
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`w-full flex-shrink-0 h-full flex flex-col justify-center items-center p-6 sm:p-10 ${slide.background} relative text-center`} // Center text on all screens
              style={{ width: `${100 / totalSlides}%` }}
            >
              {/* Central Content Area (No fixed card, content directly on background) */}
              <div className="relative z-10 max-w-lg w-full mx-auto flex flex-col items-center justify-center animate-fade-in">
                {/* Image/Icon Section */}
                <div className="mb-8 animate-fade-in-up">
                  {slide.icon ? (
                    slide.icon
                  ) : (
                    <img
                      src={slide.image}
                      alt={slide.imageAlt}
                      className="w-full h-auto max-w-[250px] sm:max-w-[350px] object-contain rounded-lg animate-fade-in-up" // Adjusted max-width for cleaner look
                    />
                  )}
                </div>

                {/* Text Content Section */}
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 animate-fade-in-up-delay-100">
                  {slide.title}
                </h2>
                <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-8 animate-fade-in-up-delay-200">
                  {slide.tagline}
                </p>
              </div>

              {/* Minimalist Background Blobs (Optional, adjust colors/sizes to be subtle) */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-green-100 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-30 blur-xl animate-blob"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-100 rounded-full translate-x-1/2 translate-y-1/2 opacity-30 blur-xl animate-blob animation-delay-2000"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Indicators (Dots) - Smaller, more subtle */}
      <div className="fixed bottom-24 sm:bottom-28 left-0 right-0 flex justify-center space-x-2 p-4 z-30">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleDotClick(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              currentSlideIndex === idx ? 'bg-green-600 scale-125' : 'bg-gray-400 hover:bg-gray-500'
            }`} // Changed inactive dot color to gray-400 for softer look
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Primary Action Button - Clean, full-width on mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-5 px-4 sm:py-6 sm:px-6 text-center shadow-md z-20"> {/* Lighter shadow, border */}
        <button
          onClick={handlePrimaryButtonClick}
          className={`flex items-center justify-center space-x-2 text-lg px-8 py-3.5 rounded-full font-semibold transition-all duration-300 shadow-lg focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-75 hover:-translate-y-0.5 w-full max-w-xs mx-auto
            ${currentSlideIndex === totalSlides - 1
              ? 'bg-green-600 hover:bg-green-700 text-white' // Last slide "Get Started" in primary color
              : 'bg-transparent text-green-600 border border-green-600 hover:bg-green-50 hover:text-green-700'}`} // Outline button for "Next"
        >
          <span>{currentSlide.buttonText}</span>
          <ArrowRight className="h-5 w-5 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default IntroductionScreen;