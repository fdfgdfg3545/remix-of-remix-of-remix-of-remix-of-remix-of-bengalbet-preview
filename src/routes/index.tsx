import { createFileRoute } from "@tanstack/react-router";
import { BengalBetShell } from "@/components/BengalBetShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BengalBet - Online Gaming Portal" },
      { name: "description", content: "BengalBet games lobby, promotions, lucky spin and VIP rewards." },
      { property: "og:title", content: "BengalBet - Online Gaming Portal" },
      { property: "og:description", content: "BengalBet games lobby, promotions, lucky spin and VIP rewards." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&family=Teko:wght@500;600;700&display=swap",
      },
    ],
  }),
  component: BengalBetShell,
});
