const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

let cachedNumber = "919506636245";

export async function loadBusinessNumber() {
  try {
    const res = await fetch(`${API}/settings/whatsapp`);
    if (res.ok) {
      const data = await res.json();
      if (data?.number) cachedNumber = data.number;
    }
  } catch {
    /* keep default */
  }
  return cachedNumber;
}

export function openWhatsApp(message) {
  window.open(`https://wa.me/${cachedNumber}?text=${encodeURIComponent(message || "")}`, "_blank", "noopener,noreferrer");
}
