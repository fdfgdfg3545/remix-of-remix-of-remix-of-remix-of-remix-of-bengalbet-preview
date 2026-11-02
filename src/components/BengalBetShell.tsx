import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import "../bengalbet/index.css";

const BengalBetApp = lazy(async () => {
  const [{ default: App }, { FavoritesProvider }] = await Promise.all([
    import("../bengalbet/App"),
    import("../bengalbet/hooks/useFavorites"),
  ]);
  return {
    default: () => (
      <FavoritesProvider>
        <App />
      </FavoritesProvider>
    ),
  };
});

export function BengalBetShell() {
  return (
    <ClientOnly fallback={<div className="min-h-screen" />}>
      <Suspense fallback={<div className="min-h-screen" />}>
        <BengalBetApp />
      </Suspense>
    </ClientOnly>
  );
}
