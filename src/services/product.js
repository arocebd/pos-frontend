import api from "./api";

export const createProduct = (form) => {
  const fd = new FormData();
  Object.entries(form).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== "") {
      fd.append(k, v);
    }
  });
  return api.post("products/", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

