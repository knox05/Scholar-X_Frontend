const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const publicBase = apiBase.replace(/\/api\/?$/, "");

export const toPublicUrl = (value) => {
  if (!value) return "";
  const cleaned = String(value).replace(/\\/g, "/").trim();
  if (!cleaned) return "";
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  if (cleaned.includes("/uploads/")) {
    const idx = cleaned.indexOf("/uploads/");
    return `${publicBase}${cleaned.slice(idx)}`;
  }
  if (cleaned.startsWith("uploads/")) return `${publicBase}/${cleaned}`;
  if (cleaned.startsWith("/")) return `${publicBase}${cleaned}`;
  return `${publicBase}/${cleaned}`;
};
