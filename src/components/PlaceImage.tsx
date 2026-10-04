import { useState, useEffect } from "react"
import type { CSSProperties } from "react"
import {
  DESTINATION_IMAGE_FALLBACK,
  getCuratedDestinationImage,
  getDestinationImage,
} from "../lib/destinationImage.js"

interface PlaceImageProps {
  destination: string
  state?: string
  alt: string
  className?: string
  fallback?: string
  style?: CSSProperties
}

export default function PlaceImage({
  destination,
  state = "",
  alt,
  className,
  fallback,
  style,
}: PlaceImageProps) {
  const targetImage =
    getCuratedDestinationImage(destination) ??
    fallback ??
    getDestinationImage(destination, state, DESTINATION_IMAGE_FALLBACK)

  const [image, setImage] = useState(targetImage)

  useEffect(() => {
    const next =
      getCuratedDestinationImage(destination) ??
      fallback ??
      getDestinationImage(destination, state, DESTINATION_IMAGE_FALLBACK)
    setImage(next)
  }, [destination, fallback, state])

  return (
    <img
      src={image}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      onError={() => {
        if (image !== DESTINATION_IMAGE_FALLBACK) {
          setImage(DESTINATION_IMAGE_FALLBACK)
        }
      }}
    />
  )
}
