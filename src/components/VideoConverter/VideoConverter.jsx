import React, { useState, useRef, useEffect } from 'react'
import {
  convertVideoToWebM,
  checkVideoConversionSupport
} from '../../utils/videoConverter'
import './VideoConverter.css'

/**
 * 视频转换组件
 * 用于将 MP4 视频转换为 WebM 格式
 */
function VideoConverter() {
  const [isConverting, setIsConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [isSupported, setIsSupported] = useState(false)
  const fileInputRef = useRef(null)

  // 检查浏览器支持
  useEffect(() => {
    const supported = checkVideoConversionSupport()
    setIsSupported(supported)
    if (!supported) {
      setError('浏览器不支持 WebM 视频转换')
    }
  }, [])

  // 处理文件选择
  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!isSupported) {
      setError('当前浏览器不支持 WebM 视频转换')
      return
    }

    // 检查文件类型
    if (!file.type.startsWith('video/')) {
      setError('请选择视频文件')
      return
    }

    try {
      setIsConverting(true)
      setProgress(0)
      setError(null)

      const blob = await convertVideoToWebM(file, {
        onProgress: (value) => {
          setProgress(Math.min(value, 99))
        }
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const originalName = file.name.replace(/\.[^/.]+$/, '')
      a.href = url
      a.download = `${originalName}.webm`

      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      URL.revokeObjectURL(url)

      setIsConverting(false)
      setProgress(100)
      setTimeout(() => {
        setProgress(0)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }, 1500)
    } catch (err) {
      console.error('转换失败:', err)
      setError(err.message || '转换失败，请重试')
      setIsConverting(false)
      setProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="video-converter">
      <h3>视频转换工具</h3>
      <p className="description">将 MP4 或其他视频格式转换为 WebM</p>

      {!isSupported && (
        <div className="error-message">您的浏览器不支持视频转换功能</div>
      )}

      <div className="converter-controls">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          disabled={isConverting || !isSupported}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isConverting || !isSupported}
          className={isConverting ? 'converting' : ''}
        >
          {isConverting ? (
            <>
              <span className="converting-indicator"></span>
              转换中... {Math.round(progress)}%
            </>
          ) : (
            '📹 选择视频文件转换为 WebM'
          )}
        </button>
      </div>

      {isConverting && (
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="converter-info">
        <p>支持格式：MP4, MOV, AVI 等</p>
        <p>输出格式：WebM (VP9/VP8 高质量编码)</p>
        <p>转换会在浏览器中完成，文件不会上传到服务器</p>
        <div className="quality-note">
          ✨ 高质量设置：自动检测帧率（最高60fps），码率15-35Mbps
        </div>
      </div>
    </div>
  )
}

export default VideoConverter

