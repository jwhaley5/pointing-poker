export function setDocumentTitle(title: string) {
  document.title = title
}

export function setNamedMeta(name: string, content: string) {
  const selector = `meta[name="${name}"]`
  const existing = document.head.querySelector<HTMLMetaElement>(selector)
  const tag = existing ?? document.createElement("meta")

  tag.setAttribute("name", name)
  tag.setAttribute("content", content)

  if (!existing) {
    document.head.appendChild(tag)
  }
}

export function setCanonical(href: string) {
  const existing = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  )
  const tag = existing ?? document.createElement("link")

  tag.setAttribute("rel", "canonical")
  tag.setAttribute("href", href)

  if (!existing) {
    document.head.appendChild(tag)
  }
}
