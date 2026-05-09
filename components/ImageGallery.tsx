"use client";

import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'

export default function ImageGallery({ images, title }: { images: string[], title: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  if (!images || images.length === 0) return null;

  return (
    <div className="relative overflow-hidden group w-full h-full" ref={emblaRef}>
      <div className="flex aspect-[16/10] w-full">
        {images.map((img, index) => (
          <div className="relative flex-[0_0_100%] min-w-0" key={index}>
            <Image
              src={img}
              alt={`${title} - Image ${index + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 100vw"
              priority={index === 0}
              className="object-cover"
            />
          </div>
        ))}
      </div>
      
      {images.length > 1 && (
        <>
          <button 
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow hover:bg-white flex items-center justify-center text-nordic-dark md:opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={scrollPrev}
          >
            <span className="material-icons">chevron_left</span>
          </button>
          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow hover:bg-white flex items-center justify-center text-nordic-dark md:opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={scrollNext}
          >
            <span className="material-icons">chevron_right</span>
          </button>
          <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm z-10">
            {selectedIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  )
}
