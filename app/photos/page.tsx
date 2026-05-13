"use client"

import { useState } from "react"
import Image from "next/image"
import { photos, categories } from "@/data/photos"

export default function Photos() {
  const [active, setActive] = useState("All")

  const filtered = active === "All" ? photos : photos.filter(p => p.category === active)

  return (
    <div className="max-w-5xl mx-auto px-8 py-20">
      <h1 className="font-display text-4xl font-semibold text-[var(--foreground)] mb-10">
        Photos
      </h1>

      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-4 py-1.5 rounded-full text-sm transition-all duration-200 ${
              active === cat
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : "border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-[var(--text-muted)] mt-20">Nothing here yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {filtered.map((photo, i) => (
            <div key={i}>
              <div className="relative aspect-[4/3] rounded overflow-hidden">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              {photo.caption && (
                <p className="text-sm text-[var(--text-muted)] mt-2">{photo.caption}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
