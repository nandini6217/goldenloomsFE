import { api } from '../api-client';

export const uploadApi = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ url: string }>('/upload', formData).then((r) => r.data.url);
  },
};
