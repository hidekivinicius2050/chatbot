"use client"

import React, { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, X, File, Image, Video, Music, FileText, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onFileRemove: () => void
  selectedFile?: File | null
  acceptedTypes?: string[]
  maxSize?: number // em MB
  className?: string
  disabled?: boolean
}

const getFileIcon = (file: File) => {
  const type = file.type.split('/')[0]
  switch (type) {
    case 'image':
      return Image
    case 'video':
      return Video
    case 'audio':
      return Music
    default:
      return FileText
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  selectedFile,
  acceptedTypes = ['image/*', 'video/*', 'audio/*', 'application/pdf'],
  maxSize = 10, // 10MB por padrão
  className,
  disabled = false
}: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setIsUploading(true)
      setUploadProgress(0)
      
      // Simular upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsUploading(false)
            onFileSelect(file)
            return 100
          }
          return prev + 10
        })
      }, 100)
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = []
      return acc
    }, {} as Record<string, string[]>),
    maxSize: maxSize * 1024 * 1024, // Converter MB para bytes
    multiple: false,
    disabled
  })

  const removeFile = () => {
    setUploadProgress(0)
    onFileRemove()
  }

  const getAcceptedTypesText = () => {
    const types = acceptedTypes.map(type => {
      switch (type) {
        case 'image/*':
          return 'Imagens'
        case 'video/*':
          return 'Vídeos'
        case 'audio/*':
          return 'Áudios'
        case 'application/pdf':
          return 'PDFs'
        default:
          return type
      }
    })
    return types.join(', ')
  }

  if (selectedFile) {
    const FileIcon = getFileIcon(selectedFile)
    
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-sm">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                disabled={disabled}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4">
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          
          {isUploading ? (
            <div className="space-y-3">
              <Upload className="h-8 w-8 mx-auto text-blue-500 animate-pulse" />
              <div>
                <p className="text-sm font-medium">Enviando arquivo...</p>
                <Progress value={uploadProgress} className="w-full mt-2" />
                <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="h-8 w-8 mx-auto text-gray-400" />
              <div>
                <p className="text-sm font-medium">
                  {isDragActive ? "Solte o arquivo aqui" : "Arraste um arquivo ou clique para selecionar"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {getAcceptedTypesText()} • Máximo {maxSize}MB
                </p>
              </div>
            </div>
          )}
        </div>

        {fileRejections.length > 0 && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-800">Arquivo rejeitado:</p>
            {fileRejections.map(({ file, errors }) => (
              <div key={file.name} className="mt-1">
                <p className="text-xs text-red-600">{file.name}</p>
                {errors.map(error => (
                  <p key={error.code} className="text-xs text-red-500">
                    {error.code === 'file-too-large' 
                      ? `Arquivo muito grande. Máximo: ${maxSize}MB`
                      : error.message
                    }
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


