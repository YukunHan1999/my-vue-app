<template>
    <div class="container">
        <div id="editor" ref="editorContainer" class="editor-container monaco-editor"></div>
        <div class="image-container">
            <div v-if="selectedLine" class="image-list">
                <el-image v-for="src in urls" :key="src" :src="src" style="width: 100%; height: 300px" :zoom-rate="1.2"
                    :preview-src-list="[src]" show-progess fit="cover" />
            </div>
        </div>
        <el-drawer v-model="flag" :size="300" direction="rtl">
            <template #header>
                <h4>{{ pkgData?.pkgname }}</h4>
            </template>
            <template #default>
                <div>
                    <el-timeline style="max-width: 600px">
                        <el-timeline-item @click="handlerChange(index, pgm)" v-for="(pgm, index) in pkgData?.pgm"
                            :key="index" :color="activeIdx == index ? 'blue' : 'grey'">
                            <a>{{ pgm.pgmname }}</a>
                        </el-timeline-item>
                    </el-timeline>
                </div>
            </template>
            <template #footer>
            </template>

        </el-drawer>
    </div>
</template>

<script lang="ts" setup>
import * as monaco from 'monaco-editor';
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { getPackageData } from '../../store/index'
import type { PackageData, ProgramData } from '../../types/data.t';

const currentPgm = ref<ProgramData>()
const activeIdx = ref<number>(0)
const handlerChange = (idx: number, pgm: ProgramData) => {
    currentPgm.value = pgm
    activeIdx.value = idx
    editor?.setValue(pgm.pgmcode)
}

const pkgData = ref<PackageData>()
// =====================================================Register Listener
onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
    pkgData.value = getPackageData()
    currentPgm.value = pkgData.value.pgm[0]
    initMonaco();
});
onBeforeUnmount(() => {
    destroyEditor();
    window.removeEventListener('keydown', handleKeyDown);
});
// 全局快捷键监听 alt+s 打开菜单
const shortcuts = ref([
    { keys: [{ label: 'Alt', class: 'alt' }, { label: 'K', class: 'regular' }], active: true },
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
// =====================================================Register Listener
const editorContainer = ref(null);
let editor: monaco.editor.IStandaloneCodeEditor | null = null;
const selectedLine = ref<Number>() // 选择行
const urls = ref<Array<string>>([])
const getImageUrl = (lineNumber: Number) => {
    let urlarr :string[] = []
    if (currentPgm.value) {
        for (let dbg of currentPgm.value.dbg) {
            if (dbg.lineno == lineNumber && dbg.atturl !== '') {
                urlarr.push("/api/preview/" + dbg.atturl)
            }
        }
    }
    urls.value = urlarr
}
const initMonaco = () => {
    if (!editorContainer.value) return;
    editor = monaco.editor.create(editorContainer.value, {
        value: pkgData.value?.pgm[0].pgmcode,
        language: 'java',
        theme: 'vs-dark',
        readOnly: true,
        lineNumbers: 'on',
        fontSize: 15,
        padding: { top: 12, bottom: 12 },
        scrollBeyondLastLine: false,
    });
    editor.onMouseDown((e) => {
        const position = e.target.position;
        if (position) {
            setTimeout(() => {
                selectedLine.value = position.lineNumber;
                getImageUrl(selectedLine.value)
            }, 10);
        }
    })
}

const destroyEditor = () => {
    if (editor) {
        editor.dispose();
    }
}
</script>

<style scoped>
.container {
    display: flex;
    max-width: 100vw;
    height: 100vh;
    overflow: hidden;
}

.editor-container {
    flex: 3;
    height: max-content;
}

#editor {
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.image-container {
    flex: 1;
    padding: 24px;
}

.image-list {
    align-items: center;
    height: 100%;
    overflow-y: scroll;
    transition: transform 0.2s;
}
</style>