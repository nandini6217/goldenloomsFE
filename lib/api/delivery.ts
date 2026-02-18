import { api } from '../api-client';

export const deliveryApi = {
  check: (pincode: string) =>
    api.get('/delivery/check', { params: { pincode } }).then((r) => r.data as { serviceable: boolean; message: string }),
};
