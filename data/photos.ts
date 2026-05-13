export type Photo = {
  src: string
  alt: string
  caption: string
  category: string
}

export const categories = ["All", "Street", "Travel", "Nature", "People"] as const
export type Category = typeof categories[number]

export const photos: Photo[] = []
