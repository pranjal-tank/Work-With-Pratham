export function resolveMedia(project) {
  const value = project.embedIdOrUrl?.trim()
  if (!value || /placeholder/i.test(value)) return null

  let identifier = value
  if (/^https?:\/\//i.test(value)) {
    let url
    try {
      url = new URL(value)
    } catch {
      return null
    }
    const host = url.hostname.toLowerCase().replace(/^www\./, '')
    if (project.mediaType === 'youtube') {
      if (host === 'youtu.be') identifier = url.pathname.split('/')[1]
      else if (['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(host)) {
        identifier = url.searchParams.get('v')
        if (!identifier && /^\/(embed|shorts|live)\//.test(url.pathname)) {
          identifier = url.pathname.split('/')[2]
        }
      } else return null
    } else if (project.mediaType === 'instagram' && host === 'instagram.com') {
      identifier = /^\/(reel|reels|p)\/([\w-]+)\/?/.exec(url.pathname)?.[2]
    } else return null
  }

  if (project.mediaType === 'youtube' && /^[\w-]{11}$/.test(identifier || '')) {
    return {
      embedUrl: `https://www.youtube-nocookie.com/embed/${identifier}?autoplay=1&rel=0`,
      externalUrl: `https://www.youtube.com/watch?v=${identifier}`,
      thumbnailUrl: `https://img.youtube.com/vi/${identifier}/maxresdefault.jpg`,
      fallbackThumbnailUrl: `https://img.youtube.com/vi/${identifier}/hqdefault.jpg`,
    }
  }
  if (project.mediaType === 'instagram' && /^[\w-]{5,64}$/.test(identifier || '')) {
    return {
      embedUrl: `https://www.instagram.com/reel/${identifier}/embed/`,
      externalUrl: `https://www.instagram.com/reel/${identifier}/`,
    }
  }
  return null
}

export function getThumbnail(project) {
  return resolveMedia(project)?.thumbnailUrl || project.thumbnailUrl || '/images/hero.jpg'
}
