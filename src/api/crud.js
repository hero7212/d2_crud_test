import request from '@/plugin/axios'

export function list (params) {
  return request({
    url: '/v1/rule-group/list',
    method: 'get',
    params
  })
}

export function add (data) {
  return request({
    url: '/v1/rule-group/add',
    method: 'post',
    data
  })
}

export function update (data, id) {
  return request({
    url: `/v1/rule-group/update/${id}`,
    method: 'put',
    data
  })
}
