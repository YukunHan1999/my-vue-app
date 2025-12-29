/**
 * Created by kate on 22/06/19
 */

/**
 * @param date 标准日期
 */
export function formatDate(dt: string | undefined) {
  if (dt) {
    let date = new Date(dt)
    
    const y = date.getFullYear()
    const month = date.getMonth() + 1
    const d = date.getDate()

    return `${y}年${month}月${d}日`
  }
}