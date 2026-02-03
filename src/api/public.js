import httpRequest from '../http';

export function getPublicAddressBtnShowAPI() {
  return httpRequest.request({
    url: '/public/address/btn-show',
    method: 'get'
  });
}
