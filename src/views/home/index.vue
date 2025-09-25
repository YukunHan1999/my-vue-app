<template>
  <h1>home</h1>
</template>

<script setup lang="ts">
import { nextTick, provide, ref } from 'vue';

const isReload = ref<Boolean>(true)

provide("reloadFile", () => {
  isReload.value = false
  nextTick(() => {
    isReload.value = true
  })
})
</script>