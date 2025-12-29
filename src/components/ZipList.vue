<template>
    <div>
        <el-drawer v-model="isEditorable" :title="isAddContent ? 'ADD DIR' : 'EDIT DIR'" direction="rtl"
            :before-close="handleClose" :close-on-press-escape="true" size="40%">
            <el-form class="dirForm" :model="dirForm" label-width="120px">
                <el-form-item label="标题:">
                    <el-input v-model="dirForm.name" />
                </el-form-item>
                <el-form-item label="描述:">
                    <textarea v-model="dirForm.desc" cols="30" rows="15" style="font-size:16px"></textarea>
                </el-form-item>
                <el-form-item label="ZipFile">
                    <el-upload ref="upload" class="upload-demo" v-model:file-list="currFileList" action="/api/upload"
                        :limit="1" :on-exceed="handleExceed" :on-success="handleZipSuccess" :auto-upload="false">
                        <template #trigger>
                            <el-button size="large" :icon="Upload" circle type="primary"></el-button>
                        </template>
                        <a :href="`/api/preview/${currFileList[0]?.url}`"
                            :download="`${currFileList[0]?.name}`"><el-button class="ml-3" size="large" :icon="Download"
                                circle type="success" @click="downloadFile">
                            </el-button></a>
                        <template #tip>
                            <div class="el-upload__tip text-red">
                                limit 1 file, new file will cover the old file
                            </div>
                        </template>
                    </el-upload>
                </el-form-item>
                <el-form-item label="所属目录:">
                    <el-select v-model="dirForm.dirid" filterable placeholder="Please select" style="width: 240px">
                        <el-option v-for="item in dirArr" :key="item.id" :label="item.name" :value="Number(item.id)" />
                    </el-select>
                </el-form-item>
            </el-form>
        </el-drawer>
        <el-dialog v-model="deleteVisible" title="删除文件提示" width="30%" draggable>
            <span>{{ title }}</span>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="deleteVisible = false">取消</el-button>
                    <el-button type="error" @click="confirmRemove">确认</el-button>
                </span>
            </template>
        </el-dialog>
        <el-table :data="data" style="width: 100%">
            <el-table-column type="index" sortable label="index" width="120" />
            <el-table-column label="文件名称">
                <template #default="scope">
                    <el-popover effect="light" trigger="hover" placement="top" width="auto">
                        <template #default>
                            <div>{{ scope.row.desc }}</div>
                        </template>
                        <template #reference>
                            <el-tag effect="dark" :type="scope.row.attachmentid > 0 ? 'primary' : 'success'"
                                @click="skip(scope.row)">{{ scope.row.name }}</el-tag>
                        </template>
                    </el-popover>
                </template>
            </el-table-column>
            <el-table-column prop="createtime" label="创建时间" />
            <el-table-column prop="updatetime" label="修改时间" />
            <el-table-column align="right">
                <template #header>
                    <el-button type="primary" :icon="CirclePlus" circle @click="openAddForm"></el-button>
                </template>
                <template #default="scope">
                    <el-button size="large" :icon="Edit" circle type="warning"
                        @click="handlerEdit(scope.$index, scope.row)"></el-button>
                    <el-button size="large" :icon="Delete" circle type="danger"
                        @click="handleDelete(scope.$index, scope.row)"></el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script setup lang="ts">
import {
    ref,
    inject,
    onBeforeMount,
    reactive,
} from "vue";
import { useRoute } from "vue-router";
import {
    createEnvData,
    deleteEnvData,
    loadEnvData,
    loadEnvDirData,
    updateEnvData,
} from "../api/http";
import { formatDate } from "../util/dateutil";
import { ElMessage, ElMessageBox, genFileId, type UploadInstance, type UploadProps, type UploadRawFile, type UploadUserFile } from "element-plus";
import { Edit, Delete, CirclePlus, Download, Upload } from "@element-plus/icons-vue";
import type { EnvData } from "../types/zip.t";
import { addZipNav } from "../store/zipnav";
import router from "../router";

const skip = async (row: EnvData) => {
    // handler directory
    let nav = {
        id: `${row.id}`,
        label: row.name,
    }
    addZipNav(nav);
    await router.push({ path: `/env/${nav.id}` });
    if (reload) reload();
}
const currFileList = ref<UploadUserFile[]>([
])
const upload = ref<UploadInstance>()
const handleExceed: UploadProps['onExceed'] = (files) => {
    upload.value!.clearFiles()
    currFileList.value = []
    const file = files[0] as UploadRawFile
    file.uid = genFileId()
    upload.value!.handleStart(file)
    currFileList.value.push(file)
    dirForm.attachmentid = file.uid
}
const handleZipSuccess: UploadProps['onSuccess'] = (
    response
) => {
    if (response.code === 20000) {
        let newAttId: number = response.data.data.id
        dirForm.attachmentid = newAttId
        dirForm.attachmentname = response.data.data.name
        dirForm.attachmenturl = response.data.data.url
    }
}
const downloadFile = () => {
    if (currFileList.value.length > 0 && currFileList.value[0].url) {
        const routePath = router.resolve(`/api/preview/${currFileList.value[0].url}`).href
        window.open(routePath, '_blank'); // Open in new tab
    }
}

//=======================================================================DIR
const isAddContent = ref<boolean>(false);
const openAddForm = () => {
    isAddContent.value = true
    // 清空表单所有数据
    dirForm.id = 0
    dirForm.name = ''
    dirForm.desc = ''
    dirForm.attachmentid = 0
    dirForm.attachmentname = ''
    dirForm.attachmenturl = ''
    dirForm.dirid = Number(parentId.value);

    // current status
    currentData.value.name = ''
    currentData.value.desc = ''
    currentData.value.attachmentid = 0
    currentData.value.dirid = Number(parentId.value)
    currFileList.value = []

    isEditorable.value = true;
};
// -----------------------------------------------------
const reload: Function | undefined = inject<Function>("reloadFile");
// ---------------------------文件的修改删除逻辑---------------------------

// 编辑逻辑
const isEditorable = ref(false);
// 编辑表单
const dirForm = reactive({
    id: 0,
    name: 'root',
    desc: '',
    createtime: '',
    updatetime: '',
    dirid: 0,
    attachmentid: 0,
    attachmentname: '',
    attachmenturl: ''
});
// ------------------模拟数据---------------------
// select 目录    // 获取编辑框标签列表
const initials = ref<Array<EnvData>>([]);
const dirArr = ref<Array<EnvData>>([]);
const removeCurrDir = (curid: number) => {
    // 获取编辑框目录列表
    loadEnvDirData().then((res: any) => {
        initials.value = res.data.data
        let first: EnvData = {
            id: 0,
            name: 'root',
            desc: '',
            createtime: '',
            updatetime: '',
            dirid: 0,
            attachmentid: 0,
            attachmentname: '',
            attachmenturl: ''
        }
        // add root empty
        initials.value.unshift(first)
        dirArr.value = []
        for (let i = 0; i < initials.value.length; i++) {
            if (Number(initials.value[i].id) !== curid) {
                dirArr.value.push(initials.value[i])
            }
        }
    });
}
// open record status
const currentData = ref<EnvData>({
    id: 0,
    name: '',
    desc: '',
    attachmentid: 0,
    dirid: 0
})
// show is edit
let isEditUpdated = (): Boolean => {
    if (currentData.value.name !== dirForm.name) {
        return true
    }
    if (currentData.value.desc !== dirForm.desc) {
        return true
    }
    if (currentData.value.dirid !== dirForm.dirid) {
        return true
    }
    if (currentData.value.attachmentid !== dirForm.attachmentid) {
        return true
    }
    return false
}
const handlerEdit = (_: string, row: EnvData) => {
    // handler directory
    dirForm.id = row.id
    dirForm.name = row.name
    dirForm.desc = row.desc
    dirForm.attachmentid = row.attachmentid
    dirForm.dirid = Number(parentId.value)
    isAddContent.value = false
    isEditorable.value = true

    // current status
    currentData.value.name = row.name
    currentData.value.desc = row.desc
    currentData.value.attachmentid = row.attachmentid
    currFileList.value = []
    if (row.attachmentid !== 0) {
        currentData.value.attachmentname = row.attachmentname
        let attUrl = row.attachmenturl ? row.attachmenturl : ''
        currentData.value.attachmenturl = attUrl
        currFileList.value.push({
            uid: row.attachmentid,
            name: row.attachmentname ? row.attachmentname : '',
            url: attUrl
        })
    }
    currentData.value.dirid = Number(parentId.value)
    removeCurrDir(Number(row.id))
};
// 发送ajax请求修改数据，重新加载界面
const handleClose = async () => {
    if (!isEditUpdated()) {
        isEditorable.value = false
        return
    }
    // upload file
    await upload.value!.submit()
    if (isAddContent.value) {
        ElMessageBox.confirm("是否确认添加?")
            .then(() => {
                let tmpEnvData = ref<EnvData>({
                    id: Number(dirForm.id),
                    name: dirForm.name,
                    desc: dirForm.desc,
                    dirid: Number(dirForm.dirid),
                    attachmentid: dirForm.attachmentid,
                })
                createEnvData(tmpEnvData.value).then(() => {
                    ElMessage({
                        message: '添加成功',
                        type: 'success'
                    })
                    isAddContent.value = false
                    if (reload) reload();
                });
            })
            .catch(() => {
            });
        return;
    } else {
        ElMessageBox.confirm("是否确认修改你编辑的内容?")
            .then(() => {
                let tmpEnvData = ref<EnvData>({
                    id: Number(dirForm.id),
                    name: dirForm.name,
                    desc: dirForm.desc,
                    dirid: Number(dirForm.dirid),
                    attachmentid: dirForm.attachmentid,
                })
                updateEnvData(tmpEnvData.value).then(() => {
                    ElMessage({
                        message: '修改成功',
                        type: 'success'
                    })
                });
                if (reload) reload();
            })
            .catch(() => {
                isEditorable.value = false
            });
    }
};

// 定义删除模板
const deleteVisible = ref(false);
const title = ref("是否确认删除?");
const currentId = ref("");

const confirmRemove = async () => {
    // 发送对应的请求删除对应文件
    deleteEnvData(Number(currentId.value)).then((res: any) => {
        if (res.data.isSuccess) {
            ElMessage({
                message: "删除成功",
                type: "success",
            });
        } else {
            ElMessage({
                message: "sorry, delete error",
                type: "warning",
            });
        }
    });
    // 删除对应的数据，关闭对话框
    deleteVisible.value = false;
    if (reload) reload();
};
// 删除逻辑
const handleDelete = (_: number, row: EnvData) => {
    // if dircetory, need check is empty
    loadEnvData(`${row.id}`).then((res: any) => {
        let fileList: EnvData[] = res.data.data;
        if (fileList != null && fileList.length > 0) {
            ElMessage({
                message: `Only delete empty directory ${row.name}!`,
                type: "warning",
            });
        } else {
            // 渲染内容删除数据
            title.value = `是否确认删除 ${row.name}?`
            currentId.value = `${row.id}`
            // 需要判断当前是要删除文件还是目录
            deleteVisible.value = true;
        }
    })
}
// ---------------------------数据加载渲染---------------------------
const route = useRoute();
const data = ref<Array<EnvData>>([]);
let parentId = ref("0");
onBeforeMount(async () => {
    // 如果有就去获取路由中的参数
    if (route.params.id) {
        parentId.value = String(route.params.id)
    }
    // 获取文件列表
    await loadEnvData(parentId.value).then((res: any) => {
        let fileList: EnvData[] | null = res.data.data;
        // handler date format
        fileList?.forEach((element) => {
            element.createtime = formatDate(element.createtime);
            element.updatetime = formatDate(element.updatetime);
        });
        // handler sort
        if (fileList !== null) {
            data.value = fileList.sort((a, b) => {
                // 提取目标字段：a.name 和 b.name，进行基础字符串比较
                if (a.name < b.name) {
                    return -1; // a 排在 b 前面
                }
                if (a.name > b.name) {
                    return 1; // a 排在 b 后面
                }
                return 0; // 两者排序位置相等
            });
        } else {
            data.value = []
        }
        removeCurrDir(-1)
    });
});
</script>

<style scoped>
.pkgEdit {
    padding: 20px;
    width: 100%;
    height: 100%;
}

.program {
    padding: 10px;
    width: 100%;
    overflow-x: hidden;
    overflow-y: scroll;
}
</style>
