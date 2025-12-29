export interface LoginData {
  username: string
  password: string
}

export interface DebugInfoData {
  dbgid: number
  lineno: number
  dbgsort: number
  attid: number
  atttype: string
  atturl: string
  uuid: string
}

export interface ProgramData {
  pgmid: number
  pgmname: string
  pgmcode: string
  pgmsort: number
  dbg: DebugInfoData[]
  uuid: string
}

export interface PackageData {
  pkgid: number
  pkgname: string
  pkgdesc: string
  dirid: number
  pgm: ProgramData[]
}

export interface PkgInfo {
  pkgData: PackageData
  attGarbage: number[]
}

export interface ClearPkg {
  pkgid: number
  attGarbage: number[]
}

export interface RemovePkgOrDir {
  id: number
  isdocx: number
} 

export interface DirData {
  id: number
  name: string
  desc: string
  dirId: number
}

export interface KateFileData {
  id: string
  name: string
  desc: string
  srcFilename: string
  url: string
  createdate?: string
  updatedate?: string
  visitCount: number
  dirId: string
  fileId: string
  isdocx: number
  deleted: number
  tagList: string[]
}

export interface BreadCrumbData {
  id: string
  label: string
}

export interface TagData {
  id: string
  tagName: string
  tagDesc: string
  visitCount: number
  deleted: number
  checked: boolean
}

export type BlogFileData = {
  body: string
  filename: string
  fileId: string
  overwrite: boolean
}

export type RecycleData = {
  id: string
  name: string
  fileId: string
  type: string
  checked: boolean
}