import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router/index.ts'

// create an axios instance
const $http = axios.create({
  // baseURL: "http://localhost:8080", // 先不用
  withCredentials: false, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

// request interceptor
$http.interceptors.request.use(
  // config => {
  //   // do something before request is sent
  //   config.headers = axios.AxiosHeaders.from({})
  //   if (getToken()) {
  //     // let each request carry token
  //     // ['X-Token'] is a custom headers key
  //     // please modify it according to the actual situation
  //     config.headers['Authorization'] = getToken() || ''
  //   }
  //   return config
  // },
  // error => {
  //   // do something with request error
  //   console.log(error) // for debug
  //   return Promise.reject(error)
  // }
)

// response interceptor
$http.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data

    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== 20000) {
      ElMessage({
        message: res.msg || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      // // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      // if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
      //   // to re-login
      //   MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
      //     confirmButtonText: 'Re-Login',
      //     cancelButtonText: 'Cancel',
      //     type: 'warning'
      //   }).then(() => {
      //     store.dispatch('user/resetToken').then(() => {
      //       location.reload()
      //     })
      //   })
      // }
      if (res.code === 403) { // 权限不做跳转到登录页面
        router.push('/login')
      }
      return Promise.reject(new Error(res.msg || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    ElMessage({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default $http
