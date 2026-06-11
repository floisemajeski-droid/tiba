'use client'
import { useState, useRef } from 'react'
import styles from './page.module.css'

const FREE_LIMIT = 5

function getUsage() {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem('tiba_usage') || '0')
}
function bumpUsage() {
  if (typeof window === 'undefined') return
  localStorage.setItem('tiba_usage', getUsage() + 1)
}

export default function Home() {
  const [imageB64, setImageB64] = useState(null)
  const [imageMime, setImageMime] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [usage, setUsage] = useState(0)
  const fileRef = useRef()

  function getMime(file) {
    const ok = ['image/jpeg','image/png','image/webp','image/gif']
    return ok.includes(file.type) ? file.type : 'image/jpeg'
  }

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      setImageB64(ev.target.result.split(',')[1])
      setImageMime(getMime(file))
      setImageUrl(ev.target.result)
      setError('')
    }
    reader.readAsDataURL(file)
  }

  async function getStyles() {
    if (!imageB64) return
    const used = getUsage()
    if (used >= FREE_LIMIT) {
      setError('You have used your 5 free looks. Upgrade for unlimited access.')
      return
    }

    setLoading(true)
    setResult(null)
    setError('')
    setLoadingMsg('Analysing your outfit…')

    try {
      const res = await fetch('/api/style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageB64, imageMime, context })
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      bumpUsage()
      setUsage(getUsage())
      setResult(json.data)
    } catch (e) {
      setError('Something went wrong: ' + e.message)
    }
    setLoading(false)
  }

  const remaining = Math.max(0, FREE_LIMIT - usage)

  return (
    <div className={styles.wrap}>
      {/* NAV */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <div className={styles.navDot} />
          <span className={styles.navName}>Tiba</span>
        </div>
        <span className={styles.navRight}>your pocket stylist · Africa's Closet</span>
      </nav>

      {/* HERO */}
      <div className={styles.hero}>
        <p className={styles.eyebrow}>Africa's Closet · AI Stylist</p>
        <h1 className={styles.h1}>Snap. Style. <em>Go.</em></h1>
        <p className={styles.heroSub}>Upload your outfit — get 3 real ways to wear it. Monday morning ready in seconds.</p>
      </div>

      {/* UPLOAD */}
      <div className={styles.uploadSection}>
        <div className={styles.uploadCard}>
          <div
            className={`${styles.uploadZone} ${imageUrl ? styles.hasImage : ''}`}
            onClick={() => fileRef.current.click()}
          >
            {imageUrl ? (
              <>
                <img src={imageUrl} className={styles.previewImg} alt="your outfit" />
                <span className={styles.changePhoto}>Tap to change photo</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className={styles.uploadIcon}><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <strong>Upload your outfit photo</strong>
                <span>tap to choose from your camera roll</span>
              </>
            )}
          </div>
          <input type="file" ref={fileRef} className={styles.hidden} accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFile} />

          {/* USAGE */}
          <div className={styles.usageBar}>
            <div className={styles.usageDots}>
              {Array.from({length: FREE_LIMIT}, (_, i) => (
                <div key={i} className={`${styles.usageDot} ${i < usage ? styles.used : ''}`} />
              ))}
            </div>
            <span className={styles.usageText}>
              <strong>{remaining}</strong> free {remaining === 1 ? 'look' : 'looks'} remaining
            </span>
          </div>

          {error && <div className={styles.err}>{error}</div>}

          <div className={styles.ctxRow}>
            <input
              type="text"
              className={styles.ctxInput}
              placeholder="Optional: occasion or context…"
              value={context}
              onChange={e => setContext(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && getStyles()}
            />
            <button
              className={styles.styleBtn}
              onClick={getStyles}
              disabled={!imageB64 || loading}
            >
              {loading ? 'Styling…' : 'Style it →'}
            </button>
          </div>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className={styles.loadingSection}>
          <div className={styles.spinner} />
          <div className={styles.loadingLabel}>{loadingMsg}</div>
        </div>
      )}

      {/* RESULT */}
      {result && (
        <div className={styles.outputSection}>
          <div className={styles.outputCard}>
            <div className={styles.resultHeader}>
              <div className={styles.resultHeadline}>{result.headline}</div>
              <div className={styles.resultSub}>{result.sub}</div>
            </div>

            {/* LOOKS GRID */}
            <div className={styles.looksGrid}>
              {[
                { tag: 'The original', ...result.original },
                { tag: 'Look 1', ...result.look1 },
                { tag: 'Look 2', ...result.look2 },
                { tag: 'Look 3', ...result.look3 },
              ].map((look, i) => (
                <div key={i} className={styles.lookCard}>
                  <div className={styles.lookTag}>{look.tag}</div>
                  <div className={styles.lookVibe}>{look.vibe}</div>
                  <div className={styles.lookCombo}>{look.combo}</div>
                  <div className={styles.lookBest}>
                    <strong>Best for</strong>{look.best_for}
                  </div>
                  {i === 0 && imageUrl && (
                    <img src={imageUrl} className={styles.lookThumb} alt="original" />
                  )}
                </div>
              ))}
            </div>

            {/* BOTTOM */}
            <div className={styles.bottomGrid}>
              <div className={styles.bp}>
                <div className={styles.bpTitle}>Why these work</div>
                <ul className={styles.whyList}>
                  {(result.why || []).map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
              <div className={styles.bp}>
                <div className={styles.bpTitle}>Where each look goes</div>
                <div className={styles.occPills}>
                  {(result.occasions || []).map((o, i) => <span key={i} className={styles.occPill}>{o}</span>)}
                </div>
              </div>
              <div className={styles.bp}>
                <div className={styles.bpTitle}>Finishing touches</div>
                <div className={styles.finList}>
                  {(result.finishing || []).map((f, i) => (
                    <div key={i} className={styles.finItem}>
                      <div className={`${styles.finDot} ${i % 2 === 0 ? styles.filled : ''}`} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.acBar}>
              <div className={styles.acText}>→ <strong>Africa's Closet:</strong> {result.ac_suggestion}</div>
              <a href="https://africascloset.com" className={styles.acLink} target="_blank" rel="noreferrer">Shop now →</a>
            </div>
          </div>
        </div>
      )}

      {/* PAYWALL */}
      {usage >= FREE_LIMIT && (
        <div className={styles.paywallSection}>
          <div className={styles.outputCard}>
            <div className={styles.paywall}>
              <h2>You've used your 5 free looks.</h2>
              <p>Upgrade to Tiba Premium for unlimited styling sessions.</p>
              <a href="https://africascloset.com" className={styles.payBtn} target="_blank" rel="noreferrer">
                Get unlimited access — $8/month
              </a>
            </div>
          </div>
        </div>
      )}

      <footer className={styles.footer}>
        Built for <a href="https://africascloset.com" style={{color:'var(--amber)',textDecoration:'none'}}>Africa's Closet</a> · Tiba means remedy · © 2026 Floise Njeru
      </footer>
    </div>
  )
}
