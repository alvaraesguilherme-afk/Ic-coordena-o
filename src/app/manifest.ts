import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Impulse",
    short_name: "Impulse",
    description: "Coordenação da rede de ICs (Igrejas nas Casas) do Impulse",
    start_url: "/",
    display: "standalone",
    background_color: "#0c1445",
    theme_color: "#0c26b0",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/maskable-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
