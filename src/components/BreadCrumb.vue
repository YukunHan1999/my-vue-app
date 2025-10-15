<template>
  <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item class="item" v-for="item in nav" :key="item.id" @click="changeRouter(item)">{{ item.label }}</el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue'
import { onMounted, ref, inject } from 'vue';
import type { BreadCrumbData } from '../types/data.t';
import { addContentNav, getNav } from '../store/index'
import { useRouter } from 'vue-router'; 

const router = useRouter()

// 问题：地址变化，但页面不刷新。 监听路由。 没完成
// watch(route.params, (before, after) => {
//   router.push(after.route.path)
// })


// 设计的思想是，放入localStorage中
/**
 * 什么时候加入[登录成功后加入]，什么时候取出[访问/:id路由取出]，什么时候修改[breadcrumb被点击的时候，文件列表点击目录的时候]。
 */
const nav = ref<Array<BreadCrumbData>>([])
onMounted(() => {
  nav.value = getNav()
})

const reload : Function | undefined = inject('reloadFile')
const changeRouter = async (item: BreadCrumbData) => {
  addContentNav(item)
  await router.push(`/code/${item.id}`)
  if (reload) reload()
}
</script>

<style scoped>
.el-breadcrumb {
  font-size: 24px;
  font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-style: italic;
}
</style>