import type { Thread } from '@/types'

interface Props {
  thread: Thread
  subcategoryName?: string
}

// Rendered off-screen and captured as image for Instagram Stories sharing.
// Dimensions are 9:16 ratio to match Instagram Stories format.
export function StoryCard({ thread, subcategoryName }: Props) {
  const truncatedContent = thread.content.length > 280
    ? thread.content.slice(0, 280) + '...'
    : thread.content

  return (
    <div
      style={{
        width: '390px',
        height: '693px',
        background: 'linear-gradient(145deg, #09090b 0%, #18181b 60%, #09090b 100%)',
        display: 'flex',
        flexDirection: 'column',
        padding: '48px 36px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <div style={{
        position: 'absolute', top: '-60px', right: '-60px',
        width: '200px', height: '200px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', bottom: '80px', left: '-40px',
        width: '160px', height: '160px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
        <div style={{
          fontSize: '22px', fontWeight: '800', color: '#ffffff',
          letterSpacing: '-0.5px',
        }}>
          YAPPR
        </div>
        {subcategoryName && (
          <>
            <div style={{ color: '#3f3f46', fontSize: '16px' }}>·</div>
            <div style={{ fontSize: '13px', color: '#71717a' }}>/{thread.subcategory?.slug ?? ''}</div>
          </>
        )}
      </div>

      {/* Thread title */}
      <div style={{
        fontSize: '26px',
        fontWeight: '700',
        color: '#ffffff',
        lineHeight: '1.3',
        marginBottom: '20px',
        letterSpacing: '-0.3px',
      }}>
        {thread.title}
      </div>

      {/* Divider */}
      <div style={{
        width: '40px', height: '2px',
        background: 'rgba(255,255,255,0.15)',
        marginBottom: '20px',
        borderRadius: '1px',
      }} />

      {/* Content */}
      <div style={{
        fontSize: '15px',
        color: '#a1a1aa',
        lineHeight: '1.6',
        flex: 1,
      }}>
        {truncatedContent}
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        padding: '16px 20px',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.07)',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#71717a', fontSize: '13px' }}>
          <span style={{ fontSize: '15px' }}>▲</span>
          <span>{thread.upvotes}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#71717a', fontSize: '13px' }}>
          <span style={{ fontSize: '15px' }}>▼</span>
          <span>{thread.downvotes}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#71717a', fontSize: '13px' }}>
          <span>💬</span>
          <span>{thread.comment_count} komentar</span>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#52525b' }}>
          {thread.mask_id}
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: '11px', color: '#52525b', marginBottom: '2px' }}>Ikut berdiskusi di</div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#a1a1aa' }}>anon.vercel.app</div>
        </div>
        <div style={{
          fontSize: '11px',
          color: '#3f3f46',
          background: 'rgba(255,255,255,0.04)',
          padding: '6px 12px',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          100% anonim
        </div>
      </div>
    </div>
  )
}
