import { useState } from "react";

export default function useStoreForm() {
  const [form, setForm] = useState({
    name: "",
    subdomain: "",
    description: "",
    logo: null,
    logoPreview: null,
    legalName: "",
    idNumber: "",
    document: null,
    paymentMethod: "",
    shipping: "",
    accepted: false,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const compressImage = async (file) => {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");

    canvas.width = 500;
    canvas.height = (bitmap.height / bitmap.width) * 500;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.7);
    });
  };

  const handleFile = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Máx 2MB");
      return;
    }

    if (field === "logo") {
      // Comprimir y convertir a base64 para que persista
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = 500;
      canvas.height = (bitmap.height / bitmap.width) * 500;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL("image/jpeg", 0.7);
      setForm({ ...form, logo: base64, logoPreview: base64 });
    } else {
      setForm({ ...form, [field]: file });
    }
  };

  return { form, setForm, handleChange, handleFile };
}
