<template>
  <div>
    <el-drawer v-model="flag" :size="300" :with-header="false" direction="ltr">
      <el-menu popper-effect="dark" class="el-menu-vertical-demo" @select="handleSelect" :default-active="activeUrl"
        text-color="#fff">
        <template v-for="firstMenuItem in menudata">
          <template v-if="firstMenuItem.children">
            <el-sub-menu :index="firstMenuItem.index">
              <template #title>
                <span v-text="firstMenuItem.title"></span>
              </template>
              <template v-for="secondMenuItem in firstMenuItem.children">
                <template v-if="secondMenuItem.children">
                  <el-sub-menu :index="secondMenuItem.index">
                    <template #title>
                      <span v-text="secondMenuItem.title"></span>
                    </template>
                    <template v-for="thirdMenuItem in secondMenuItem.children">
                      <el-menu-item :index="thirdMenuItem.index">
                        <span v-text="thirdMenuItem.title"></span>
                      </el-menu-item>
                    </template>
                  </el-sub-menu>
                </template>
                <template v-else>
                  <el-menu-item :index="secondMenuItem.index">
                    <span v-text="secondMenuItem.title"></span>
                  </el-menu-item>
                </template>
              </template>
            </el-sub-menu>
          </template>
          <template v-else>
            <el-menu-item :index="firstMenuItem.index">
              <span v-text="firstMenuItem.title"></span>
            </el-menu-item>
          </template>
        </template>

      </el-menu>
    </el-drawer>
    <router-view v-if="isRouterAlive" />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, provide, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { MenuItem } from './types/menu.t';
import { getZipNav, initZipNav } from './store/zipnav';
import { getNav, initContentNav } from './store/contentnav';

const router = useRouter()
const menudata = reactive<MenuItem[]>([
  {
    "index": "/home",
    "title": "Home",
  },
  {
    "index": "/code/0",
    "title": "代码"
  },
  {
    "index": "/doc",
    "title": "文档"
  },
  {
    "index": "/env/0",
    "title": "ENV"
  }
])
const activeUrl = ref('')
const handleSelect = (key: string) => {
  if (key === '/code/0') {
    const nav = getNav()
    if (nav.length > 1) {
        // skip to position
        key = `/code/${nav[nav.length - 1].id}`
    }
  } else if (key === '/env/0') {
    const nav = getZipNav()
    if (nav.length > 1) {
        // skip to position
        key = `/env/${nav[nav.length - 1].id}`
    }
  }
  router.push({
    path: key
  })
}

// =====================================================注册监听
onMounted(() => {
  initZipNav()
  initContentNav()
  window.addEventListener('keydown', handleKeyDown);
});
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
// 全局快捷键监听 alt+s 打开菜单
const shortcuts = ref([
  { keys: [{ label: 'Alt', class: 'alt' }, { label: 'S', class: 'regular' }], active: true },
]);
const flag = ref(false)
const handleKeyDown = (event: any) => {
  // 检查是否匹配已注册的快捷键
  for (const shortcut of shortcuts.value) {
    if (!shortcut.active) continue;

    const keys = shortcut.keys.map(k => k.label);
    const requiresCtrl = keys.includes('Ctrl');
    const requiresAlt = keys.includes('Alt');
    const requiresShift = keys.includes('Shift');
    const requiresKey = keys.find(k => !['Ctrl', 'Alt', 'Shift'].includes(k));
    if (
      requiresCtrl === event.ctrlKey &&
      requiresAlt === event.altKey &&
      requiresShift === event.shiftKey &&
      requiresKey === event.key.toUpperCase()
    ) {
      event.preventDefault();
      flag.value = !flag.value
      break;
    }
  }
};
// =====================================================重新加载
const isRouterAlive = ref(true)

provide("reloadFile", () => {
  reload()
})

const reload = () => {
  isRouterAlive.value = false
  nextTick(() => {
    isRouterAlive.value = true
  })
}
</script>

<style scoped lang="sass">
</style>