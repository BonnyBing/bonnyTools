/**
 * 视频转换工具
 * 用于将视频文件转换为 WebM 格式
 */

/**
 * 将视频文件转换为 WebM 格式
 * @param {File} videoFile - 视频文件
 * @param {Object} options - 转换选项
 * @param {number} options.fps - 输出帧率，默认 60（高质量）
 * @param {number} options.bitrate - 视频码率（bps），默认自动计算（高质量）
 * @param {Function} options.onProgress - 进度回调函数
 * @returns {Promise<Blob>} 返回 WebM 格式的 Blob
 */
export async function convertVideoToWebM(videoFile, options = {}) {
  const {
    fps = 60, // 默认 60fps 高质量
    bitrate = null, // null 表示自动计算
    onProgress
  } = options

  return new Promise((resolve, reject) => {
    // 创建视频元素
    const video = document.createElement('video')
    video.src = URL.createObjectURL(videoFile)
    video.crossOrigin = 'anonymous'
    video.preload = 'auto'

    // 创建 Canvas
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    let mediaRecorder = null
    let animationFrameId = null
    const chunks = []

    // 视频加载完成
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // 设置 Canvas 高质量渲染
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      // 获取原始视频帧率
      const originalFps = video.getVideoPlaybackQuality?.()?.totalVideoFrames
        ? Math.round(video.getVideoPlaybackQuality().totalVideoFrames / video.duration)
        : 30
      const targetFps = fps || Math.min(originalFps || 60, 60)

      // 获取视频流（高质量帧率）
      const stream = canvas.captureStream(targetFps)

      // 确定编码格式（优先 VP9，更高质量）
      let mimeType = 'video/webm'
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        mimeType = 'video/webm;codecs=vp9'
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
        mimeType = 'video/webm;codecs=vp8'
      }

      // 自动计算高质量码率（如果未指定）
      let finalBitrate = bitrate
      if (!finalBitrate) {
        const pixels = canvas.width * canvas.height
        if (pixels <= 1920 * 1080) {
          finalBitrate = 15000000 // 1080p: 15Mbps
        } else if (pixels <= 2560 * 1440) {
          finalBitrate = 25000000 // 1440p: 25Mbps
        } else {
          finalBitrate = 35000000 // 4K: 35Mbps
        }
      }

      // 创建 MediaRecorder（高质量设置）
      mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: finalBitrate
      })

      // 收集数据
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      // 录制完成
      mediaRecorder.onstop = () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId)
        }

        const blob = new Blob(chunks, { type: 'video/webm' })
        URL.revokeObjectURL(video.src)
        resolve(blob)
      }

      // 错误处理
      mediaRecorder.onerror = (event) => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId)
        }
        URL.revokeObjectURL(video.src)
        reject(new Error('录制失败: ' + event.error))
      }

      // 开始录制
      mediaRecorder.start()
      video.play()

      // 绘制帧
      const drawFrame = () => {
        if (video.ended || video.paused) {
          if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop()
          }
          return
        }

        // 使用高质量图像平滑
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        // 绘制当前帧（保持原始分辨率）
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // 更新进度
        if (onProgress && video.duration) {
          const progress = (video.currentTime / video.duration) * 100
          onProgress(progress)
        }

        // 继续下一帧
        animationFrameId = requestAnimationFrame(drawFrame)
      }

      // 开始绘制
      drawFrame()
    }

    // 视频可播放
    video.oncanplay = () => {
      // 确保视频播放
      video.play().catch(reject)
    }

    // 错误处理
    video.onerror = (event) => {
      URL.revokeObjectURL(video.src)
      reject(new Error('视频加载失败'))
    }

    // 加载视频
    video.load()
  })
}

/**
 * 检查浏览器是否支持视频转换
 * @returns {boolean}
 */
export function checkVideoConversionSupport() {
  return (
    typeof MediaRecorder !== 'undefined' &&
    typeof HTMLCanvasElement !== 'undefined' &&
    typeof HTMLVideoElement !== 'undefined' &&
    typeof HTMLCanvasElement.prototype.captureStream === 'function'
  )
}

