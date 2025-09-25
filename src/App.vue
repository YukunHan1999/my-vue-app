<template>
  <div id="#app">
    <div>
      <el-drawer v-model="flag" :size="300" :with-header="false" direction="ltr">
        <el-menu active-text-color="#ffd04b" background-color="#545c64" popper-effect="dark" class="el-menu-vertical-demo"  @select="handleSelect"
              :default-active="activeUrl" text-color="#fff" >
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
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, provide, ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter()
const menudata = [
  {
    "index": "/home",
    "title": "Home",
    children: [
      {
        "index": "/home",
        "title": "目录"
      },
      {
        "index": "/code",
        "title": "代码"
      },
      {
        "index": "/doc",
        "title": "文档",
        children: [
          {
            "index": "/code",
            "title": "代码"
          },
        ]
      }
    ]
  },
  {
    "index": "/home",
    "title": "Home"
  },
  {
    "index": "/code",
    "title": "代码"
  },
  {
    "index": "/doc",
    "title": "文档"
  }
]
const activeUrl = ref('')
const handleSelect = (key: string) => {
  router.push({
    path: key
  })
}

// =====================================================注册监听
onMounted(() => {
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





// 重新加载
const isRouterAlive = ref(true)
const isReload = ref<Boolean>(true)

provide("reloadFile", () => {
  isReload.value = false
  nextTick(() => {
    isReload.value = true
  })
})

provide("reload", () => {
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
nav 
  background-color: #292a2d
  a
    font-weight: bold
    color: white

  & .router-link-exact-active
    color: #42b983

.item 
  position: absolute
  right: 25px
  color: white
</style>