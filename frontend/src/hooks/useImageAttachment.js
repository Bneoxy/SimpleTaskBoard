import { useEffect, useRef, useState } from 'react'

export function useImageAttachment() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const fileInputRef = useRef(null)

  const setImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return

    const namedFile =
      file.name && file.name !== 'image.png'
        ? file
        : new File([file], `screenshot-${Date.now()}.png`, { type: file.type || 'image/png' })

    setImage(namedFile)
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current)
      return URL.createObjectURL(namedFile)
    })
  }

  const handlePaste = (event) => {
    const items = event.clipboardData?.items
    if (!items) return

    for (const item of items) {
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) {
          setImageFile(file)
          event.preventDefault()
        }
        break
      }
    }
  }

  const clearImage = () => {
    setImage(null)
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current)
      return null
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  return {
    image,
    preview,
    fileInputRef,
    setImageFile,
    clearImage,
    openFilePicker: () => fileInputRef.current?.click(),
    handlePaste,
  }
}
