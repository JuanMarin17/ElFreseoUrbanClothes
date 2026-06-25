const API_ROOT = import.meta.env.VITE_API_URL;

const authHeader = () => {
  const jwt = localStorage.getItem("jwt");
  return jwt ? { Authorization: `Bearer ${jwt}` } : {};
};

async function request(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(new Error("El servidor no respondió a tiempo. Intenta de nuevo.")),
    timeoutMs,
  );
  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
        ...options.headers,
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  let body;
  const ct = res.headers.get("Content-Type") ?? "";
  body = ct.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    const message = typeof body === "object" ? (body.message ?? `Error ${res.status}`) : body || `Error ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return body?.data ?? body;
}

/** GET /admin/reports/plans */
export function getPlanStats() {
  return request(`${API_ROOT}/admin/reports/plans`);
}

/** GET /admin/reports/revenue/monthly?months=N */
export function getMonthlyRevenue(months = 6) {
  return request(`${API_ROOT}/admin/reports/revenue/monthly?months=${months}`);
}

/** Descarga CSV — abre en nueva pestaña o dispara descarga */
export function exportSalesCSV() {
  const jwt = localStorage.getItem("jwt");
  const url = `${API_ROOT}/admin/reports/sales/export`;
  const a   = document.createElement("a");
  a.href    = jwt ? `${url}?token=${jwt}` : url;
  a.setAttribute("download", "informe-ventas.csv");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
