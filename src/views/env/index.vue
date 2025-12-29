<template>
    <div class="container">
        <div class="maincontainer">
            <ZipBreadCrumb />
            <el-divider content-position="left">文件列表</el-divider>
            <zip-list></zip-list>
        </div>
    </div>
</template>

<script setup lang="ts">
import ZipBreadCrumb from '../../components/ZipBreadCrumb.vue';
import ZipList from '../../components/ZipList.vue';
</script>

<style scoped>
.maincontainer {
    margin: 0 auto;
    padding-top: 3vh;
    width: 60vw;
    height: 100vh;
}
</style>