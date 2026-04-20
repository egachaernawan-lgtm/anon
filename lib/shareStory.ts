import { toPng } from 'html-to-image'

function copyToClipboardFallback(text: string) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

export async function shareAsStory(
  cardElement: HTMLElement,
  fallbackUrl: string,
  title: string
): Promise<'story' | 'share' | 'copied'> {
  // Try generating image for Instagram Stories
  try {
    const dataUrl = await toPng(cardElement, {
      pixelRatio: 2,
      skipAutoScale: true,
    })

    const res = await fetch(dataUrl)
    const blob = await res.blob()
    const file = new File([blob], 'anon-thread.png', { type: 'image/png' })

    // Mobile: share image file (shows Instagram Stories in system sheet)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title })
      return 'story'
    }
  } catch {
    // Fall through to URL sharing
  }

  // Desktop: try Web Share API with URL
  if (navigator.share) {
    try {
      await navigator.share({ title, url: fallbackUrl })
      return 'share'
    } catch {
      // User cancelled or not supported — fall through
    }
  }

  // Last resort: textarea-based copy (no permission needed)
  try {
    await navigator.clipboard.writeText(fallbackUrl)
  } catch {
    copyToClipboardFallback(fallbackUrl)
  }
  return 'copied'
}
