import { api } from '../api-client';

export const chatbotApi = {
  submit: (data: {
    name: string;
    phone: string;
    productTypeRequired: string;
    message?: string;
  }) => api.post('/chatbot', data).then((r) => r.data),
};
