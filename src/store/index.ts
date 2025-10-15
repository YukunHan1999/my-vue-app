/**
 * 在vue中做状态管理的话，统一使用localStorage,
 * 需要存储的数据,统一在此声明key
 */
import type { BreadCrumbData, PackageData } from "../types/data.t"

// ----------PkgData-Operation----------
const pkgdata = 'pkgdata'
const setPackageData = (data: PackageData) => {
  localStorage.setItem(pkgdata, JSON.stringify(data))
}
const getPackageData = () => {
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


// ----------Token操作----------
const token = 'custom-token'
const setToken = (tokenStr: string) => {
  localStorage.setItem(token, tokenStr)
}
const getToken = () => {
  let res = localStorage.getItem(token);
  if (res === null ) res = ''
  return res
}

// ----------breadcrumps操作----------
const contentNav: string = 'content-nav';
/**
 * 添加，修改，删除。
 */
// 初始化目录导航
const initContentNav = () => {
  let data = [{
    id: "0",
    label: "Code"
  }]
  localStorage.setItem(contentNav, JSON.stringify(data));
}

const getNav = () => {
  let tmpNav = localStorage.getItem(contentNav)
  if (tmpNav) {
    return JSON.parse(tmpNav)
  }
  return null
}
// 移除目录导航
const removeNav = () => {
  localStorage.removeItem(contentNav);
}
// 添加新的导航
const addContentNav = (data: BreadCrumbData) => {
  // 拿到nav
  let nav = localStorage.getItem(contentNav)
  if (!nav) {
    console.error('无法获取到目录导航信息，请先初始化。')
    return
  }
  let tmpNav: Array<BreadCrumbData> = JSON.parse(nav)
  // 加入的ID不能和前面的数据重复。
  for (let t of tmpNav) {
    if (data.id === t.id) {
      backItemNav(t.id) // 如果路由已经加过了，就把当前路由以后的全部干掉。
      return
    }
  }
  tmpNav.push(data)
  localStorage.setItem(contentNav, JSON.stringify(tmpNav))
}

/**
 * 向后后回退导航。
 * 根据ID从后向前遍历，如果不相等就移除。直到根目录位置。
 */
const backItemNav = (id: string) => {
  // 拿到nav
  let nav = localStorage.getItem(contentNav)
  if (!nav) {
    console.error('无法获取到目录导航信息，请先初始化。')
    return
  }
  let tmpNav: Array<BreadCrumbData> = JSON.parse(nav)
  // 从后向前遍历，到第一个或者id相等的时候停止。
  let i = tmpNav.length - 1;
  for (; i > 0; i--) {
    if (tmpNav[i].id === id) {
      break
    }
  }
  // 当前 i以后的都移除掉。
  let currentNav = tmpNav.slice(0, i + 1)
  localStorage.setItem(contentNav, JSON.stringify(currentNav))
}


export { setToken, getToken, initContentNav, getNav, addContentNav, removeNav, setPackageData, getPackageData }