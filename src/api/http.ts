import type { CodeTemplate } from '../types/test.t'
import $http from './index'

// 登录请求
// export const login = (data: LoginData) => $http({ baseURL: blogHost, url: "/user/login", method: "POST", data })

// 查询代码模板的总条数
export const codeCount = () => $http({ url: "/api/code/count", method: "GET" })
// 查询代码的数据
export const loadCodeData = (pageNo: Number, pageSize: Number) => $http({ url: "/api/code", method: "GET", params: { pageNo, pageSize} })
// 新增或修改数据
export const saveOrUpdateCodeTemplate = (code: CodeTemplate) => $http({ url: "/api/code", method: "POST", data: code })

// 删除数据
export const deleteCodeTemplate = (id: Number) => $http({ url: "/api/code/" + id, method: "DELETE" })