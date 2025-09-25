// ----------Token操作----------
const token = 'custom-token'
export const setToken = (tokenStr: string) => {
  localStorage.setItem(token, tokenStr)
}
export const getToken = () => {
  let res = localStorage.getItem(token);
  if (res === null ) res = ''
  return res
}