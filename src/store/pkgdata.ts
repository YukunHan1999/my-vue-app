/**
 * 在vue中做状态管理的话，统一使用localStorage,
 * 需要存储的数据,统一在此声明key
 */
import type { PackageData } from "../types/data.t"

// ----------PkgData-Operation----------
const pkgdata = 'pkg-data'
export const setPackageData = (data: PackageData) => {
  localStorage.setItem(pkgdata, JSON.stringify(data))
}
export const getPackageData = () => {
  let res = localStorage.getItem(pkgdata);
  if (res === null ) return {
    pkgid: 0,
    pkgname: '',
    pkgdesc: '',
    dirid: 0,
    pgm: [],
  }
  let data :PackageData = JSON.parse(res)
  return data
}

// ----------AttData-Operation----------
// fetch need clear Temporary Attachment
// const getClearTmpAttData = () => {

// }
// set need clear Temporary Attachment
// const setClearTmpAttData = () => {
  
// }