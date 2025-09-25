<template>
  <div> 
    <nav>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <template v-for="item in menudata">
        <router-link :to="item.link">{{ item.title }}</router-link>&nbsp;&nbsp;&nbsp;&nbsp;
      </template> 
      <span class="item">追求内心，爱之所爱，不问西东。</span>
    </nav>
  </div>
</template>

<script lang="ts" setup>
const menudata = [
  {
    "title": "目录",
    "link": "/home"
  },
  {
    "title": "代码",
    "link": "/code"
  },
  {
    "title": "文档",
    "link": "/doc"
  }
]



</script>

<style lang="sass" scoped>
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
