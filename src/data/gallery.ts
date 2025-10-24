// Prosty model danych galerii — 1 miejsce do edycji opisów
export type GalleryItem = {
  src: string;         // ścieżka w /public/images
  alt: string;         // alternatywny opis (SEO / dostępność)
  title?: string;      // krótki tytuł projektu/zdjęcia
  description?: string;// 1-2 zdania opisu
  width?: number;      // realne wymiary pliku (opcjonalnie, ale warto)
  height?: number;
};

const gallery: GalleryItem[] = [
  {
    src: "/images/galeria1.jpg",
    alt: "Suknia NIKIEL z sesji studyjnej",
    title: "Kolekcja Noir 01",
    description: "Minimalistyczna sylwetka z akcentem strukturalnym.",
    width: 2048, height: 1365
  },
  {
    src: "/images/galeria2.jpg",
    alt: "Detal konstrukcyjny ramienia",
    title: "Detal konstrukcji",
    description: "Precyzja cięcia i gra światła na fakturze.",
    width: 2048, height: 1365
  },
  {
    src: "/images/galeria3.jpg",
    alt: "Look z pleneru miejskiego",
    title: "Urban Look",
    description: "Kontrast form z surową architekturą miasta.",
    width: 2048, height: 1365
  },
];

export default gallery;
