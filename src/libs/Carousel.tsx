'use client';
import {useEffect, useState} from "react";
import Image from "next/image";
import {ChevronLeft, ChevronRight} from "@mui/icons-material";
import ImagePreview from "@/libs/ImagePreview";

type ImageItem = {
  imageId: number | string;
  imageUrl: string;
}

type Props = {
  title: string,
  images: ImageItem[];
  showImages?: boolean;
  showDots?: boolean;
  showArrows?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}
export default function Carousel(
  {
    title,
    images,
    showImages = true,
    showDots = true,
    showArrows = true,
    autoPlay = true,
    autoPlayInterval = 3000
  }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  }
  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };
  return (
    <div className="flex flex-col  relative w-full h-full rounded-lg shadow-lg border border-primary-c200/30 overflow-hidden group">
      <div
        className="flex transition-transform duration-500 ease-in-out flex-1"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={image.imageId} className="relative w-full h-full flex-shrink-0"
               onClick={() => setSelectedImage(image.imageUrl)}
          >
            <Image src={image.imageUrl} alt={title} fill className="object-contain" priority={index === 0} />

          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Previous image"
          >
            <ChevronLeft className="text-white" sx={{ fontSize: 24 }} />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Next image"
          >
            <ChevronRight className="text-white" sx={{ fontSize: 24 }} />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && images.length > 1 && (
        <div className=" flex space-x-2 items-center justify-center mt-4 mb-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${
                index === currentIndex ? "bg-primary-c500 scale-125" : "bg-primary-c500/50 hover:bg-primary-c500/70"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
      {showImages && images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto px-2 items-center justify-center">
          {images.map((image, index) => (
            <div
              key={image.imageId}
              className={`w-16 h-16 rounded-lg border-2 cursor-pointer flex-shrink-0 overflow-hidden transition-all duration-200 flex items-center justify-center ${
                index === currentIndex ? "border-primary-c700" : "border-transparent hover:border-primary-c300"
              }`}
              onClick={() => goToSlide(index)}
            >
              <Image
                src={image.imageUrl}
                alt={`${title} thumbnail ${index + 1}`}
                width={64}
                height={64}
                className="object-contain w-full h-full"
              />
            </div>
          ))}
        </div>
      )}

      {images.length > 1 && (
        <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs">
          {currentIndex + 1} / {images.length}
        </div>
      )}
      {selectedImage && <ImagePreview imageUrl={selectedImage} onClose={()=>setSelectedImage(null)}/>}
    </div>
  );
}