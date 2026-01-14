import api from "@/axios";

export function analyzeReport(reportText, options = {}) {
  const token = localStorage.getItem('access') || localStorage.getItem('token');
  if (!token) {
    return Promise.reject({ message: 'Authentication required. Please log in.' });
  }
  const payload = Object.assign({ report_text: reportText }, options || {});
  return api.post("ai/report-analysis/", payload);
}
