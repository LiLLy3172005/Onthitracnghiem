import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

export const resolveFileUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) return url;
  return `http://127.0.0.1:8000${url.startsWith('/') ? '' : '/'}${url}`;
};

// Tự động đính kèm Token khi có request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Bắt lỗi và chuẩn hóa thông báo tiếng Việt
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (!error.response.data || typeof error.response.data !== 'object') {
        error.response.data = {};
      }

      if (error.response.status === 401) {
        localStorage.removeItem('token');
        error.response.data.message = 'Phiên đăng nhập đã hết hạn hoặc bạn chưa đăng nhập. Vui lòng đăng nhập lại.';
      } else if (error.response.status === 403) {
        if (!error.response.data.message || error.response.data.message === 'This action is unauthorized.') {
          error.response.data.message = 'Bạn không có quyền thực hiện thao tác này.';
        }
      } else if (error.response.status === 404) {
        if (!error.response.data.message || error.response.data.message.toLowerCase().includes('not found')) {
          error.response.data.message = 'Không tìm thấy dữ liệu yêu cầu.';
        }
      } else if (error.response.status >= 500) {
        if (!error.response.data.message || error.response.data.message === 'Server Error') {
          error.response.data.message = 'Máy chủ đang bận hoặc gặp sự cố, vui lòng thử lại sau.';
        }
      }
    } else if (error.message === 'Network Error') {
      error.message = 'Lỗi kết nối máy chủ, vui lòng kiểm tra lại mạng.';
    }
    return Promise.reject(error);
  }
);