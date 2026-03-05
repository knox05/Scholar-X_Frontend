export function getApiError(err, fallback = "Request failed") {
  const status = err?.response?.status;
  const message = err?.response?.data?.message || err?.message || fallback;

  if (status === 401) {
    return "Session expired or unauthorized. Please login again.";
  }
  if (status === 403) {
    return "Access denied for this action.";
  }
  if (status === 404) {
    return "Requested data was not found.";
  }
  if (status === 429) {
    return "Too many requests. Please wait and retry.";
  }
  return message;
}

export function isObjectId(value) {
  return /^[0-9a-fA-F]{24}$/.test((value || "").trim());
}
