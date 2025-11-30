import httpRequest from '../http';


export function getGameServerListApi() {
  return httpRequest.request({
    url: '/jiuYin/syncServer',
    method: 'get'
  });
}
/**
 * 同步吧务名称列表
 * @param data
 */
export function syncBaWuApi(data) {
  return httpRequest.request({
    url: '/jiuYin/syncBaWu',
    method: 'get',
    data
  });
}
