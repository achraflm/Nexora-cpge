"use client"

// Lazy rendering : suit les éléments [data-page] proches de la zone visible d'un conteneur
// défilant. Seules ces pages sont rendues ; les autres libèrent leur canvas.
import { useCallback, useEffect, useRef, useState } from "react"

export function useVisiblePages(root: HTMLElement | null, rootMargin = "120% 0px", deps: unknown[] = []) {
  const [visible, setVisible] = useState<Set<number>>(() => new Set([1, 2]))
  const observerRef = useRef<IntersectionObserver | null>(null)
  const elements = useRef(new Map<number, HTMLElement>())

  useEffect(() => {
    if (!root) return
    const obs = new IntersectionObserver(
      (entries) => {
        setVisible((prev) => {
          let changed = false
          const next = new Set(prev)
          for (const e of entries) {
            const n = Number((e.target as HTMLElement).dataset.page)
            if (!n) continue
            if (e.isIntersecting && !next.has(n)) {
              next.add(n)
              changed = true
            } else if (!e.isIntersecting && next.has(n)) {
              next.delete(n)
              changed = true
            }
          }
          return changed ? next : prev
        })
      },
      { root, rootMargin }
    )
    observerRef.current = obs
    elements.current.forEach((el) => obs.observe(el))
    return () => {
      obs.disconnect()
      observerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root, rootMargin, ...deps])

  const register = useCallback((page: number, el: HTMLElement | null) => {
    const prev = elements.current.get(page)
    if (prev && prev !== el) observerRef.current?.unobserve(prev)
    if (el) {
      elements.current.set(page, el)
      observerRef.current?.observe(el)
    } else {
      elements.current.delete(page)
    }
  }, [])

  return { visible, register, elements: elements.current }
}
