import httpRequest from '../http';

/**
 * 获取我的地址列表
 */
export function getMyAddressListAPI() {
  return httpRequest.request({
    url: '/address/my/list',
    method: 'get',
  });
}

/**
 * 获取地址详情
 * @param id
 */
export function getAddressAPI(id) {
  return httpRequest.request({
    url: `/address?id=${id}`,
    method: 'get',
  });
}

/**
 * 新增地址
 * @param data
 */
export function addAddressAPI(data) {
  return httpRequest.request({
    url: '/address/',
    method: 'post',
    data: data,
  });
}

/**
 * 修改地址
 * @param data
 */
export function updateAddressAPI(data) {
  return httpRequest.request({
    url: '/address/',
    method: 'put',
    data: data,
  });
}

/**
 * 删除地址
 * @param id
 */
export function deleteAddressAPI(id) {
  return httpRequest.request({
    url: `/address/${id}`,
    method: 'delete',
  });
}
