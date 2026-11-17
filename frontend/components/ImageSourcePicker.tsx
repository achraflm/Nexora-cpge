'use client'

import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { Camera, Upload } from 'lucide-react'
import { acceptedImages, imageFileError } from '@/lib/read-image-to-latex'

export function ImageSourcePicker({ disabled, onSelect, onError, onCameraChange, children }: {
  disabled?: boolean
  onSelect: (file: File) => void
  onError: (message: string) => void
  onCameraChange?: (active: boolean) => void
  children?: ReactNode
}) {
  const upload = useRef<HTMLInputElement>(null)
  const capture = useRef<HTMLInputElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const stream = useRef<MediaStream | null>(null)
  const request = useRef(0)
  const [preview, setPreview] = useState<MediaStream | null>(null)
  const [starting, setStarting] = useState(false)
  const [capturing, setCapturing] = useState(false)

  useEffect(() => {
    if (video.current) video.current.srcObject = preview
  }, [preview])

  useEffect(() => () => {
    request.current++
    stream.current?.getTracks().forEach(track => track.stop())
  }, [])

  function stopCamera() {
    request.current++
    stream.current?.getTracks().forEach(track => track.stop())
    stream.current = null
    setPreview(null)
    setStarting(false)
    setCapturing(false)
    onCameraChange?.(false)
  }

  function choose(file: File) {
    const message = imageFileError(file)
    if (message) onError(message)
    else onSelect(file)
  }

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (file) choose(file)
  }

  async function startCamera() {
    onError('')
    if (!navigator.mediaDevices?.getUserMedia) {
      capture.current?.click()
      return
    }
    const attempt = ++request.current
    setStarting(true)
    onCameraChange?.(true)
    try {
      const source = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 2560 }, height: { ideal: 1920 } },
        audio: false,
      })
      if (attempt !== request.current) {
        source.getTracks().forEach(track => track.stop())
        return
      }
      stream.current = source
      setPreview(source)
    } catch {
      if (attempt === request.current) {
        onError('La caméra est indisponible. Vous pouvez importer une image.')
        onCameraChange?.(false)
      }
    } finally {
      if (attempt === request.current) setStarting(false)
    }
  }

  function takePhoto() {
    const frame = video.current
    if (!frame?.videoWidth || !frame.videoHeight) {
      onError('Attendez que l’aperçu de la caméra s’affiche.')
      return
    }
    const canvas = document.createElement('canvas')
    const scale = Math.min(1, 3840 / Math.max(frame.videoWidth, frame.videoHeight))
    canvas.width = Math.max(1, Math.round(frame.videoWidth * scale))
    canvas.height = Math.max(1, Math.round(frame.videoHeight * scale))
    const context = canvas.getContext('2d')
    if (!context) {
      onError('Impossible de prendre une photo dans ce navigateur.')
      return
    }
    context.drawImage(frame, 0, 0, canvas.width, canvas.height)
    setCapturing(true)
    const attempt = request.current
    canvas.toBlob(photo => {
      if (attempt !== request.current) return
      stopCamera()
      if (photo) choose(new File([photo], 'photo.jpg', { type: 'image/jpeg' }))
      else onError('La photo n’a pas pu être enregistrée. Réessayez.')
    }, 'image/jpeg', 0.96)
  }

  return <div className="space-y-3">
    <input ref={capture} type="file" accept={acceptedImages.join(',')} capture="environment" hidden onChange={selectFile} />
    <input ref={upload} type="file" accept={acceptedImages.join(',')} hidden onChange={selectFile} />
    <div className="flex flex-wrap gap-2">
      {children}
      <button type="button" onClick={() => void startCamera()} disabled={disabled || starting || Boolean(preview)} className="ui-button-secondary disabled:opacity-50">
        <Camera size={16} aria-hidden="true" />{starting ? 'Ouverture de la caméra…' : 'Prendre une photo'}
      </button>
      <button type="button" onClick={() => { stopCamera(); upload.current?.click() }} disabled={disabled} className="ui-button-secondary disabled:opacity-50">
        <Upload size={16} aria-hidden="true" />Importer une image
      </button>
    </div>
    {preview && <div className="space-y-2">
      <video ref={video} autoPlay muted playsInline aria-label="Aperçu de la caméra" className="mx-auto max-h-72 max-w-full rounded-xl bg-slate-950" />
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={takePhoto} disabled={capturing} className="ui-button-primary">Capturer la photo</button>
        <button type="button" onClick={stopCamera} className="ui-button-secondary">Fermer la caméra</button>
      </div>
    </div>}
  </div>
}
