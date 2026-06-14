import { useState } from "react";

export default function useStoreBuilder() {
    const [store, setStore] = useState({
      name: "",
      subdomain: "",
      approved: false,
      acceptedTerms: false,
      layout: "minimal",
      colors: {
        primary: "#2563eb",
        background: "#020617",
        text: "#ffffff",
      },
      font: "Inter",
      banner: {
        title: "",
        subtitle: "",
        image: null,
      },
    });
    
  const update = (field, value) => {
    setStore((prev) => ({ ...prev, [field]: value }));
  };

  const updateNested = (section, field, value) => {
    setStore((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  return { store, update, updateNested };
}
