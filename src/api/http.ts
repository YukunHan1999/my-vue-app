import type { CodeTemplate } from '../types/test.t'
import type { DirData,  RemovePkgOrDir, AddPkg} from '../types/data.t'
import $http from './index'

// 登录请求
// export const login = (data: LoginData) => $http({ url: "/user/login", method: "POST", data })


// code
export const addContent = (file: DirData) => $http({ url: '/api/debug/dir', method: "POST", data: file })
// new package
export const addPkgInfo = (file: AddPkg) => $http({ url: '/api/debug/pkg', method: "POST", data: file })
// new package
export const updatePkgInfo = (file: AddPkg) => $http({ url: '/api/debug/pkg', method: "PUT", data: file })
// new package
export const loadPkg = (id: string) => $http({ url: `/api/debug/pkg/${id}`, method: "GET"})
// remove pkg or Dir
export const deletePkgOrDir = (file: RemovePkgOrDir) => $http({ url: `/api/debug`, method: 'DELETE', data: file })
// 修改文件
export const updateFile = (file: DirData) => $http({ url: '/api/debug', method: "PUT", data: file })
// 获取所有目录结构
export const fetchDirList = () => $http({ url: '/api/debug', method: 'GET' })
// 获取文件列表
export const fetchFileList = (parentId: string) => $http({ url: `/api/debug/${parentId}`, method: "GET" })

// doc
// 查询代码模板的总条数
export const codeCount = () => $http({ url: "/api/code/count", method: "GET" })
// 查询代码的数据
export const loadCodeData = (pageNo: Number, pageSize: Number) => $http({ url: "/api/code", method: "GET", params: { pageNo, pageSize} })
// 新增或修改数据
export const saveOrUpdateCodeTemplate = (code: CodeTemplate) => $http({ url: "/api/code", method: "POST", data: code} )
// 删除数据
export const deleteCodeTemplate = (id: Number) => $http({ url: "/api/code/" + id, method: "DELETE" })