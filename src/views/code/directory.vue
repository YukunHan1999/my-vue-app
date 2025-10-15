<template>
    <div class="container">
        <div class="maincontainer">
            <bread-crumb />
            <el-divider content-position="left">文件列表</el-divider>
            <file-list></file-list>
        </div>
    </div>
</template>

<script setup lang="ts">
import BreadCrumb from '../../components/BreadCrumb.vue';
import FileList from '../../components/FileList.vue';
// import type { KateFileData } from '../types/data.t';

</script>

<style scoped>
.maincontainer {
    margin: 0 auto;
    padding-top: 3vh;
    width: 60vw;
    height: 100vh;
}
</style>