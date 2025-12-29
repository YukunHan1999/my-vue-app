import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

import Home from '@/views/home/index.vue'
import Code from '@/views/code/edit.vue'
import Directory from '@/views/code/directory.vue'
import Env from '@/views/env/index.vue'
import Doc from '@/views/doc/index.vue'
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    redirect: '/home',
    children: [
      {
        path: '/home',
        name: '主页',
        component: Home,
        meta: {
          title: '主页'
        }
      },
      {
        path: '/code/:id',
        name: '测试',
        component: Directory,
        meta: {
          title: '测试'
        }
      },
      {
        path: '/doc',
        name: '文档',
        component: Doc,
        meta: {
          title: '文档'
        }
      },
      {
        path: '/preview',
        name: 'preview',
        component: Code
      },
      {
        path: '/env/:id',
        name: 'env',
        component: Env,
        meta: {
          title: 'env'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// router.beforeEach((to, from, next) => {
//     const token: string = getToken()
//     if (token === '' && to.path !== '/login') {
//       console.log(token);

//       next({
//         path: '/login',
//         query: {redirect: to.fullPath}  // 将跳转的路由path作为参数，登录成功后跳转到该路由
//       })
//     } else if (token && to.path === '/login') {
//       next()
//     }

//   // if (to.meta.requireAuth) {
//   // } else {
//   //   next()
//   // }
// })

export default router
