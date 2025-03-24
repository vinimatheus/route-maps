import { useState, useEffect } from "react";

export function useMapResourcesLoader() {
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (window.L) {
      setIsMapReady(true);
      return;
    }

    const loadCSS = (url: string): Promise<void> =>
      new Promise((resolve) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = url;
        link.onload = () => resolve();
        document.head.appendChild(link);
      });

    const loadScript = (url: string): Promise<void> =>
      new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = url;
        script.async = true;
        script.onload = () => resolve();
        document.head.appendChild(script);
      });

    const loadAll = async () => {
      try {
        await loadCSS("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css");
        await loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js");

        await loadCSS(
          "https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css"
        );
        await loadScript(
          "https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.min.js"
        );

        
        if (window.L) {
          console.log("Leaflet e RoutingMachine carregados.");
          setIsMapReady(true);
        } else {
          console.error("Leaflet não foi carregado corretamente.");
        }
      } catch (error) {
        console.error("Erro ao carregar recursos do Leaflet:", error);
      }
    };

    loadAll();
  }, []);

  return isMapReady;
}
