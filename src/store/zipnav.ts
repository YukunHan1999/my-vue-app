import type { BreadCrumbData } from "../types/data.t"

// ----------breadcrumps操作----------
const zipNav: string = 'zip-nav';
/**
 * 添加，修改，删除。
 */
// 初始化目录导航
const initZipNav = () => {
  let data = [{
    id: "0",
    label: "Zip"
  }]
  localStorage.setItem(zipNav, JSON.stringify(data));
}

const getZipNav = () => {
  let tmpNav = localStorage.getItem(zipNav)
  if (tmpNav) {
    return JSON.parse(tmpNav)
  }
  return null
}
// 移除目录导航
const removeZipNav = () => {
  localStorage.removeItem(zipNav);
}
// 添加新的导航
const addZipNav = (data: BreadCrumbData) => {
  // 拿到nav
  let nav = localStorage.getItem(zipNav)
  if (!nav) {
    console.error('无法获取到目录导航信息，请先初始化。')
    return
  }
  let tmpNav: Array<BreadCrumbData> = JSON.parse(nav)
  // 加入的ID不能和前面的数据重复。
  for (let t of tmpNav) {
    if (data.id === t.id) {
      backZipNav(t.id) // 如果路由已经加过了，就把当前路由以后的全部干掉。
      return
    }
  }
  tmpNav.push(data)
  localStorage.setItem(zipNav, JSON.stringify(tmpNav))
}

/**
 * 向后后回退导航。
 * 根据ID从后向前遍历，如果不相等就移除。直到根目录位置。
 */
const backZipNav = (id: string) => {
  // 拿到nav
  let nav = localStorage.getItem(zipNav)
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
  localStorage.setItem(zipNav, JSON.stringify(currentNav))
}

export {initZipNav, getZipNav, addZipNav, removeZipNav}