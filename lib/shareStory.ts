import { toPng } from 'html-to-image'

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

    // Convert data URL to File
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    const file = new File([blob], 'anon-thread.png', { type: 'image/png' })

    // Check if device supports file sharing (mobile only)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title,
      })
      return 'story'
    }
  } catch {
    // Fall through to URL sharing
  }

  // Fallback: share URL
  if (navigator.share) {
    await navigator.share({ title, url: fallbackUrl })
    return 'share'
  }

  // Last resort: copy to clipboard
  await navigator.clipboard.writeText(fallbackUrl)
  return 'copied'
}
