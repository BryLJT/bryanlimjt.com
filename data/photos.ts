export type Photo = {
  src: string
  alt: string
  caption: string
  category: string
}

export const categories = ["All", "Street", "Travel", "Nature", "People"] as const
export type Category = typeof categories[number]

export const photos: Photo[] = [
  { src: "/images/photos/DSC_5597.JPG", alt: "test drive", caption: "test drive", category: "People" },
  { src: "/images/photos/DSC_5610.JPG", alt: "home and simplicity", caption: "home and simplicity", category: "People" },
  { src: "/images/photos/DSC_5714.JPG", alt: "kiss", caption: "kiss", category: "Nature" },
  { src: "/images/photos/DSC_5742.JPG", alt: "zoooom", caption: "zoooom", category: "Street" },
  { src: "/images/photos/DSC_5753.JPG", alt: "zooom 2", caption: "zooom 2", category: "Street" },
]
