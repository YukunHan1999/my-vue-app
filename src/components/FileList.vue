<template>
    <div>
        <el-dialog v-model="debugInfoDialogForm" align-center
            :title="isEditDebugInfoDialogForm ? 'EDIT DebugInfo' : 'ADD DebugInfo'">
            <el-form :model="dbgForm">
                <el-form-item label="Lineno" label-width="140px">
                    <el-input-number v-model="dbgForm.lineno" />
                </el-form-item>
                <el-form-item label="Photo" label-width="140px">
                    <el-upload class="avatar-uploader" action="/api/upload" :show-file-list="false"
                        :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
                        <img v-if="imageUrl" style="width: 50px; height: 40px" :src="'/api/preview/' + dbgForm.atturl"
                            class="avatar" />
                        <el-icon v-else class="avatar-uploader-icon">
                            <Plus />
                        </el-icon>
                    </el-upload>
                </el-form-item>
                <el-form-item label="Sort" label-width="140px">
                    <el-input-number v-model="dbgForm.dbgsort" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="cancelDbgFormEdit()">取消</el-button>
                    <el-button type="primary" @click="confirmDbgFormEdit()">
                        确认
                    </el-button>
                </span>
            </template>
        </el-dialog>
        <el-dialog v-model="programDialogForm" align-center
            :title="isEditProgramDialogForm ? 'EDIT Program' : 'ADD Program'">
            <el-form :model="pgmForm">
                <el-form-item label="语言名称" label-width="140px">
                    <el-input v-model="pgmForm.pgmname" placeholder="Please input" />
                </el-form-item>
                <el-form-item label="代码片段" label-width="140px">
                    <el-icon :size="20" :color="pgmActivate" @click="copyDocument(pgmForm.pgmcode)">
                        <DocumentCopy />
                    </el-icon>
                    <el-input v-model="pgmForm.pgmcode" :rows="20" type="textarea" placeholder="Please input" />
                </el-form-item>
                <el-form-item label="Sort" label-width="140px">
                    <el-input-number v-model="pgmForm.pgmsort" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="cancelPgmFormEdit()">取消</el-button>
                    <el-button type="primary" @click="confirmPgmFormEdit()">
                        确认
                    </el-button>
                </span>
            </template>
        </el-dialog>
        <el-drawer v-model="isEditorablePkg" direction="ttb" :before-close="cancelPkgInfo" :close-on-press-escape="true"
            size="100%">
            <template #header>
                <h4> {{ isAddPkg ? 'ADD PKG' : 'EDIT PKG' }}</h4>
            </template>
            <template #default>
                <div class="pkgEdit">
                    <el-form class="pkgForm" :model="pkgTableData">
                        <el-row>
                            <el-col :offset="2" :span="4">
                                <el-form-item label="标题:">
                                    <el-input v-model="pkgTableData.pkgname" style="width: 240px;" />
                                </el-form-item>
                            </el-col>
                            <el-col :offset="1" :span="4">
                                <el-form-item label="描述:">
                                    <textarea v-model="pkgTableData.pkgdesc" style="width: 240px; font-size:16px"
                                        cols="150" rows="2"></textarea>
                                </el-form-item>
                            </el-col>
                            <el-col :offset="1" :span="4">
                                <el-form-item label="所属目录:">
                                    <el-select v-model="pkgTableData.dirid" filterable placeholder="Please select"
                                        style="width: 240px">
                                        <el-option v-for="item in dirArr" :key="item.id" :label="item.name"
                                            :value="Number(item.id)" />
                                    </el-select>
                                </el-form-item>
                            </el-col>

                        </el-row>
                    </el-form>
                    <div class="program">
                        <el-row>
                            <el-col :offset="2" :span="8">
                                <el-table :data="pkgTableData.pgm" style="width: 100%" height="60vh"
                                    highlight-current-row @current-change="handlerPgmDataChange"
                                    :default-sort="{ prop: 'sort' }" :border="true" :preserve-expanded-content="true">
                                    <el-table-column type="index" sortable label="index" width="60" />
                                    <el-table-column prop="pgmname" label="Name" width="180" />
                                    <el-table-column prop="pgmcode" label="Code" :show-overflow-tooltip="true"
                                        width="180" />
                                    <el-table-column prop="pgmsort" label="Sort" width="60" />
                                    <el-table-column align="right">
                                        <template #header>
                                            <el-button size="small" :icon="Plus" circle type="success"
                                                @click="openAddPgm" />
                                        </template>
                                        <template #default="scope">
                                            <el-button size="small" :icon="Edit" circle type="warning"
                                                @click="openEditPgm(scope.row)"></el-button>
                                            <el-button size="small" :icon="Delete" circle type="danger"
                                                @click="openDeletePgm(scope.row)"></el-button>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </el-col>

                            <el-col :offset="2" :span="8">
                                <el-table :data="currPgm?.dbg" style="width: 100%" height="60vh" :border="true">
                                    <el-table-column type="index" sortable label="index" width="60" />
                                    <el-table-column prop="lineno" label="LineNo" width="180" />
                                    <el-table-column label="Attachment" width="180">
                                        <template #default="scope">
                                            <el-image preview-teleported style="width: 30px; height: 20px"
                                                :src="'/api/preview/' + scope.row.atturl"
                                                :preview-src-list="['/api/preview/' + scope.row.atturl]" />
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="dbgsort" label="Sort" width="60" />
                                    <el-table-column align="right">
                                        <template #header>
                                            <el-button size="small" :icon="Plus" circle type="primary"
                                                :disabled="currPgm == undefined ? true : false"
                                                @click="openAddDbg(currPgm)" />
                                        </template>
                                        <template #default="scope">
                                            <el-button size="small" :icon="Edit" circle type="warning"
                                                @click="openEditDebugInfo(currPgm, scope.row)" />
                                            <el-button size="small" :icon="Delete" circle type="danger"
                                                @click="openDeleteDebugInfo(scope.$index, scope.row)" />
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </el-col>

                        </el-row>
                    </div>
                </div>
            </template>
            <template #footer>
                <div style="flex: auto">
                    <el-button type="warning" @click="cancelPkgInfo">cancel</el-button>
                    <el-button type="success" @click="savePkgInfo">Save</el-button>
                    <el-button type="primary" @click="previewPkgInfo">Preview</el-button>
                </div>
            </template>
        </el-drawer>
        <el-drawer v-model="isEditorable" :title="isAddContent ? 'ADD DIR' : 'EDIT DIR'" direction="rtl"
            :before-close="handleClose" :close-on-press-escape="true" size="40%">
            <el-form class="dirForm" :model="dirForm" label-width="120px">
                <el-form-item label="标题:">
                    <el-input v-model="dirForm.name" />
                </el-form-item>
                <el-form-item label="描述:">
                    <textarea v-model="dirForm.desc" cols="30" rows="15" style="font-size:16px"></textarea>
                </el-form-item>
                <el-form-item label="所属目录:">
                    <el-select v-model="dirForm.dirId" filterable placeholder="Please select" style="width: 240px">
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
                            <el-tag effect="dark" :type="scope.row.isdocx ? 'primary' : 'success'"
                                @click="skip(scope.row)">{{ scope.row.name }}</el-tag>
                        </template>
                    </el-popover>
                </template>
            </el-table-column>
            <el-table-column prop="createdate" label="创建时间" />
            <el-table-column prop="updatedate" label="修改时间" />
            <el-table-column align="right">
                <template #header>
                    <el-button type="primary" :icon="CirclePlus" circle @click="openAddForm"></el-button>
                    <el-button type="success" :icon="Plus" circle @click="openAddPkg"></el-button>
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
import { useRouter, useRoute } from "vue-router";
import {
    addContent,
    addPkgInfo,
    clearPkgData,
    deletePkgOrDir,
    fetchDirList,
    fetchFileList,
    loadPkg,
    updateContent,
    updatePkgInfo,
} from "../api/http";
import type { PkgInfo, ClearPkg, DebugInfoData, KateFileData, PackageData, ProgramData, RemovePkgOrDir } from "../types/data.t";
import { formatDate } from "../util/dateutil";
import { ElMessage, ElMessageBox, type UploadProps } from "element-plus";
import { addContentNav, setPackageData } from "../store/index";
import { Plus, Edit, Delete, CirclePlus } from "@element-plus/icons-vue";
import { v4 as uuidv4 } from 'uuid';

//=======================================================================PACKAGE
// add or edit pkg
const isEditorablePkg = ref<boolean>(false)
const isAddPkg = ref<boolean>(false)
// Clear Temporary Attachment List
const clearAttIdArray = reactive<Set<Number>>(new Set())

const openAddPkg = () => {
    // 清空表单所有数据
    pkgTableData.pkgid = 0
    pkgTableData.pkgname = ""
    pkgTableData.pkgdesc = ""
    pkgTableData.dirid = Number(parentId.value)
    pkgTableData.pgm = []

    isAddPkg.value = true
    isFile.value = true
    isEditorablePkg.value = true
}
const pkgTableData = reactive<PackageData>({
    pkgid: 0,
    pkgname: "",
    pkgdesc: "",
    dirid: 0,
    pgm: []
})
// preview package info
const previewPkgInfo = () => {
    setPackageData(pkgTableData)
    const routePath = router.resolve('/preview').href
    window.open(routePath, '_blank'); // Open in new tab
}
// save package info
const savePkgInfo = () => {
    let attids: number[] = []
    for (let tmp of clearAttIdArray) {
        attids.push(tmp.valueOf())
    }
    let pkgData: PkgInfo = {
        pkgData: pkgTableData,
        attGarbage: attids,
    }
    if (pkgTableData.pkgid === 0) {
        //  invoke save action
        addPkgInfo(pkgData).then((res: any) => {
            if (res.data.isSuccess === true) {
                ElMessage({
                    type: 'success',
                    message: 'Success!',
                })
                // clear and close
                pkgTableData.pkgid = 0
                pkgTableData.pkgname = ''
                pkgTableData.pkgdesc = ''
                pkgTableData.dirid = 0
                pkgTableData.pgm = []
                isEditorablePkg.value = false
            }
        })
    } else {
        //  invoke save action
        updatePkgInfo(pkgData).then((res: any) => {
            if (res.data.isSuccess === true) {
                ElMessage({
                    type: 'success',
                    message: 'Success!',
                })
                // clear and close
                pkgTableData.pkgid = 0
                pkgTableData.pkgname = ''
                pkgTableData.pkgdesc = ''
                pkgTableData.dirid = 0
                pkgTableData.pgm = []
                isEditorablePkg.value = false
            }
        })
    }
}
// clear package info
const cancelPkgInfo = () => {
    let attids: number[] = []
    for (let tmp of clearAttIdArray) {
        attids.push(tmp.valueOf())
    }
    if (attids.length > 0) {
        let clearPkg: ClearPkg = {
            pkgid: pkgTableData.pkgid,
            attGarbage: attids
        }
        // all data is new data
        clearPkgData(clearPkg).then((res: any) => {
            if (res.data.isSuccess === true) {
                ElMessage({
                    type: 'success',
                    message: 'Success!',
                })
                isEditorablePkg.value = false
            }
        })
    }
    isEditorablePkg.value = false
}

//=======================================================================PROGRAM
const currPgm = ref<ProgramData>()
const programDialogForm = ref<boolean>(false)
const isEditProgramDialogForm = ref<boolean>(false)
const pgmForm = reactive<ProgramData>({
    pgmid: 0,
    pgmname: '',
    pgmcode: '',
    pgmsort: 0,
    uuid: '',
    dbg: [],
})
const openAddPgm = () => {
    // clear    
    pgmForm.pgmid = 0
    pgmForm.pgmname = ''
    pgmForm.pgmcode = ''
    pgmForm.pgmsort = 0
    pgmForm.uuid = ''
    // open
    programDialogForm.value = true
    isEditProgramDialogForm.value = false
}
const pgmActivate = ref('')
const copyDocument = (val: string) => {
    navigator.clipboard.writeText(val)
    pgmActivate.value = '#409EFC'
}
// confirm
const confirmPgmFormEdit = () => {
    if (isEditProgramDialogForm.value === false) {
        // add pgm
        pgmForm.uuid = uuidv4()
        if (pkgTableData.pgm == null) {
            pkgTableData.pgm = []
        }
        pkgTableData.pgm.push({
            pgmid: 0,
            pgmname: pgmForm.pgmname,
            pgmcode: pgmForm.pgmcode,
            pgmsort: pgmForm.pgmsort,
            uuid: pgmForm.uuid,
            dbg: []
        })
    } else {
        // update pgm
        for (let item of pkgTableData.pgm) {
            if (item.pgmid !== 0) {
                // match pgmid
                if (item.pgmid === pgmForm.pgmid) {
                    item.pgmname = pgmForm.pgmname
                    item.pgmcode = pgmForm.pgmcode
                    item.pgmsort = pgmForm.pgmsort
                }
            } else {
                // match uuid
                if (item.uuid === pgmForm.uuid) {
                    item.pgmname = pgmForm.pgmname
                    item.pgmcode = pgmForm.pgmcode
                    item.pgmsort = pgmForm.pgmsort
                }
            }
        }
    }
    // sort pkgTableData.pgm
    pkgTableData.pgm.sort((x, y) => {
        return x.pgmsort - y.pgmsort
    })
    programDialogForm.value = false
}
// cancel
const cancelPgmFormEdit = () => {
    programDialogForm.value = false
}
const openEditPgm = (row: ProgramData) => {
    pgmForm.pgmid = row.pgmid;
    pgmForm.pgmname = row.pgmname;
    pgmForm.pgmcode = row.pgmcode;
    pgmForm.pgmsort = row.pgmsort;
    pgmForm.uuid = row.uuid;
    programDialogForm.value = true
    isEditProgramDialogForm.value = true
}
const openDeletePgm = (row: ProgramData) => {
    ElMessageBox.confirm(
        `是否确认删除 ${row.pgmname}?`,
        'Warning',
        {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: 'warning',
        }
    )
        .then(() => {
            // remove pgm by id or uuid
            if (row.pgmid === 0) {
                // memory, need depend on uuid to remove
                let tmparr: ProgramData[] = []
                for (let pgm of pkgTableData.pgm) {
                    if (pgm.uuid !== row.uuid) {
                        tmparr.push({
                            pgmid: pgm.pgmid,
                            pgmname: pgm.pgmname,
                            pgmcode: pgm.pgmcode,
                            pgmsort: pgm.pgmsort,
                            uuid: pgm.uuid,
                            dbg: pgm.dbg,
                        })
                    }
                }
                pkgTableData.pgm = tmparr
            } else {
                // db, need depend on pgmid
                let tmparr: ProgramData[] = []
                for (let pgm of pkgTableData.pgm) {
                    if (pgm.pgmid !== row.pgmid) {
                        tmparr.push({
                            pgmid: pgm.pgmid,
                            pgmname: pgm.pgmname,
                            pgmcode: pgm.pgmcode,
                            pgmsort: pgm.pgmsort,
                            uuid: pgm.uuid,
                            dbg: pgm.dbg,
                        })
                    }
                }
                pkgTableData.pgm = tmparr
            }
            ElMessage({
                type: 'success',
                message: 'Delete completed',
            })
        })
        .catch(() => {
            ElMessage({
                type: 'info',
                message: 'Delete canceled',
            })
        })
}
const handlerPgmDataChange = (pgm: ProgramData | undefined) => {
    currPgm.value = pgm
}
//=======================================================================DEBUGINFO
const imageUrl = ref<string>('')
const debugInfoDialogForm = ref<boolean>(false)
const isEditDebugInfoDialogForm = ref<boolean>(false)
const currentPgm = ref<ProgramData>({
    pgmid: 0,
    pgmname: '',
    pgmcode: '',
    pgmsort: 0,
    uuid: '',
    dbg: []
})
const dbgForm = reactive<DebugInfoData>({
    dbgid: 0,
    lineno: 0,
    dbgsort: 0,
    attid: 0,
    atttype: "",
    atturl: "",
    uuid: ""
})
const handleAvatarSuccess: UploadProps['onSuccess'] = (
    response,
    uploadFile
) => {
    if (response.code === 20000) {
        let newAttId: number = response.data.data.id
        // all att data need to record
        if (dbgForm.attid !== 0) {
            clearAttIdArray.add(dbgForm.attid)
        }
        clearAttIdArray.add(newAttId)
        dbgForm.attid = newAttId
        dbgForm.atttype = response.data.data.type
        dbgForm.atturl = response.data.data.url
        imageUrl.value = URL.createObjectURL(uploadFile.raw!)
    }
}
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
    //    if (rawFile.type !== 'image/jpeg') {
    //        ElMessage.error('Avatar picture must be JPG format!')
    //        return false
    //    } 
    if (rawFile.size / 1024 / 1024 > 2) {
        ElMessage.error('Avatar picture size can not exceed 2MB!')
        return false
    }
    return true
}
const openAddDbg = (pgm: ProgramData | undefined) => {
    if (pgm) {
        // pgmid
        currentPgm.value = pgm
        // clear
        dbgForm.dbgid = 0
        dbgForm.lineno = 0
        dbgForm.dbgsort = 0
        dbgForm.attid = 0
        dbgForm.atttype = ''
        dbgForm.atturl = ''
        dbgForm.uuid = ''
        imageUrl.value = ''
        // open
        debugInfoDialogForm.value = true
        isEditDebugInfoDialogForm.value = false
    }
}
const openEditDebugInfo = (pgm: ProgramData | undefined, row: DebugInfoData) => {
    if (pgm) {
        // pgmid
        currentPgm.value = pgm
        // equal
        dbgForm.dbgid = row.dbgid
        dbgForm.lineno = row.lineno
        dbgForm.dbgsort = row.dbgsort
        dbgForm.attid = row.attid
        dbgForm.atttype = row.atttype
        dbgForm.atturl = row.atturl
        dbgForm.uuid = row.uuid
        imageUrl.value = row.atturl
        // open
        debugInfoDialogForm.value = true
        isEditDebugInfoDialogForm.value = true
    }
}
const openDeleteDebugInfo = (idx: number, row: DebugInfoData) => {
    ElMessageBox.confirm(
        `are you sure remove line ${idx + 1}?`,
        'Warning',
        {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: 'warning',
        }
    )
        .then(() => {
            // remove from pkgdata by dbgid or uuid
            // match program, match debuginfo
            if (currentPgm.value.pgmid === 0) {
                // match uuid
                for (let pgm of pkgTableData.pgm) {
                    if (pgm.uuid === currentPgm.value.uuid) {
                        let tmparr: DebugInfoData[] = []
                        for (let tmp of pgm.dbg) {
                            if (tmp.uuid !== row.uuid) {
                                tmparr.push({
                                    dbgid: tmp.dbgid,
                                    lineno: tmp.lineno,
                                    dbgsort: tmp.dbgsort,
                                    attid: tmp.attid,
                                    atttype: tmp.atttype,
                                    atturl: tmp.atturl,
                                    uuid: tmp.uuid
                                })
                            }
                        }
                        pgm.dbg = tmparr
                    }
                }
            } else {
                // match pgmid
                for (let pgm of pkgTableData.pgm) {
                    if (pgm.pgmid === currentPgm.value.pgmid) {
                        if (row.dbgid === 0) {
                            // memory
                            let tmparr: DebugInfoData[] = []
                            for (let tmp of pgm.dbg) {
                                if (tmp.uuid !== row.uuid) {
                                    tmparr.push({
                                        dbgid: tmp.dbgid,
                                        lineno: tmp.lineno,
                                        dbgsort: tmp.dbgsort,
                                        attid: tmp.attid,
                                        atttype: tmp.atttype,
                                        atturl: tmp.atturl,
                                        uuid: tmp.uuid
                                    })
                                }
                            }
                            pgm.dbg = tmparr
                        } else {
                            // db
                            let tmparr: DebugInfoData[] = []
                            for (let tmp of pgm.dbg) {
                                if (tmp.dbgid !== row.dbgid) {
                                    tmparr.push({
                                        dbgid: tmp.dbgid,
                                        lineno: tmp.lineno,
                                        dbgsort: tmp.dbgsort,
                                        attid: tmp.attid,
                                        atttype: tmp.atttype,
                                        atturl: tmp.atturl,
                                        uuid: tmp.uuid
                                    })
                                }
                            }
                            pgm.dbg = tmparr
                        }
                    }
                }
            }
            ElMessage({
                type: 'success',
                message: 'Delete completed',
            })
        })
        .catch(() => {
            ElMessage({
                type: 'info',
                message: 'Delete canceled',
            })
        })
}
const confirmDbgFormEdit = () => {
    // match program, match debuginfo
    if (currentPgm.value.pgmid === 0) {
        // match uuid   
        for (let i = 0; i < pkgTableData.pgm.length; i++) {
            if (pkgTableData.pgm[i].uuid === currentPgm.value.uuid) {
                if (isEditDebugInfoDialogForm.value === false) {
                    if (pkgTableData.pgm[i].dbg == null) {
                        pkgTableData.pgm[i].dbg = []
                    }
                    // add
                    pkgTableData.pgm[i].dbg.push({
                        dbgid: dbgForm.dbgid,
                        lineno: dbgForm.lineno,
                        dbgsort: dbgForm.dbgsort,
                        attid: dbgForm.attid,
                        atttype: dbgForm.atttype,
                        atturl: dbgForm.atturl,
                        uuid: uuidv4()
                    })
                } else {
                    // edit
                    if (dbgForm.dbgid === 0) {
                        // memory
                        for (let tmp of pkgTableData.pgm[i].dbg) {
                            if (tmp.uuid === dbgForm.uuid) {
                                tmp.dbgid = dbgForm.dbgid
                                tmp.lineno = dbgForm.lineno
                                tmp.dbgsort = dbgForm.dbgsort
                                tmp.attid = dbgForm.attid
                                tmp.atttype = dbgForm.atttype
                                tmp.atturl = dbgForm.atturl
                            }
                        }
                    } else {
                        // db
                        for (let tmp of pkgTableData.pgm[i].dbg) {
                            if (tmp.dbgid === dbgForm.dbgid) {
                                tmp.dbgid = dbgForm.dbgid
                                tmp.lineno = dbgForm.lineno
                                tmp.dbgsort = dbgForm.dbgsort
                                tmp.attid = dbgForm.attid
                                tmp.atttype = dbgForm.atttype
                                tmp.atturl = dbgForm.atturl
                            }
                        }
                    }
                }
                pkgTableData.pgm[i].dbg.sort((x, y) => {
                    if (x.lineno - y.lineno !== 0) {
                        return x.lineno - y.lineno
                    } else {
                        return x.dbgsort - y.dbgsort
                    }
                })
            }
        }
    } else {
        // match pgmid
        for (let i = 0; i < pkgTableData.pgm.length; i++) {
            if (pkgTableData.pgm[i].pgmid === currentPgm.value.pgmid) {
                if (isEditDebugInfoDialogForm.value === false) {
                    if (pkgTableData.pgm[i].dbg == null) {
                        pkgTableData.pgm[i].dbg = []
                    }
                    // add
                    pkgTableData.pgm[i].dbg.push({
                        dbgid: dbgForm.dbgid,
                        lineno: dbgForm.lineno,
                        dbgsort: dbgForm.dbgsort,
                        attid: dbgForm.attid,
                        atttype: dbgForm.atttype,
                        atturl: dbgForm.atturl,
                        uuid: uuidv4()
                    })
                } else {
                    // edit
                    if (dbgForm.dbgid === 0) {
                        // memory
                        for (let tmp of pkgTableData.pgm[i].dbg) {
                            if (tmp.uuid === dbgForm.uuid) {
                                tmp.dbgid = dbgForm.dbgid
                                tmp.lineno = dbgForm.lineno
                                tmp.dbgsort = dbgForm.dbgsort
                                tmp.attid = dbgForm.attid
                                tmp.atttype = dbgForm.atttype
                                tmp.atturl = dbgForm.atturl
                            }
                        }
                    } else {
                        // db
                        for (let tmp of pkgTableData.pgm[i].dbg) {
                            if (tmp.dbgid === dbgForm.dbgid) {
                                tmp.dbgid = dbgForm.dbgid
                                tmp.lineno = dbgForm.lineno
                                tmp.dbgsort = dbgForm.dbgsort
                                tmp.attid = dbgForm.attid
                                tmp.atttype = dbgForm.atttype
                                tmp.atturl = dbgForm.atturl
                            }
                        }
                    }
                }
                pkgTableData.pgm[i].dbg.sort((x, y) => {
                    if (x.lineno - y.lineno !== 0) {
                        return x.lineno - y.lineno
                    } else {
                        return x.dbgsort - y.dbgsort
                    }
                })
            }
        }
    }
    debugInfoDialogForm.value = false
}
const cancelDbgFormEdit = () => {
    debugInfoDialogForm.value = false
}
// //=======================================================================Content
const isAddContent = ref<boolean>(false);
const openAddForm = () => {
    isAddContent.value = true;
    // 清空表单所有数据
    dirForm.id = "";
    dirForm.name = "";
    dirForm.desc = "";
    dirForm.srcFilename = "";
    dirForm.dirId = Number(parentId.value);
    dirForm.tags = [];
    isFile.value = false
    isEditorable.value = true;
};
// -----------------------------------------------------
const reload: Function | undefined = inject<Function>("reloadFile");
const skip = async (row: KateFileData) => {
    if (row.isdocx === 0) {
        // handler directory
        let nav = {
            id: row.id,
            label: row.name,
        };
        addContentNav(nav);
        await router.push({ path: `/code/${nav.id}` });
        if (reload) reload();
    } else {
        loadPkg(row.id).then((res: any) => {
            setPackageData(res.data.data)
            const routePath = router.resolve('/preview').href
            window.open(routePath, '_blank'); // Open in new tab
        })
    }
};

// ---------------------------文件的修改删除逻辑---------------------------

// 编辑逻辑
const isEditorable = ref(false);
// 编辑表单
const dirForm = reactive({
    id: "",
    name: "",
    desc: "",
    srcFilename: "",
    fileId: "",
    dirId: 0,
    url: "",
    tags: [""],
});
// ------------------模拟数据---------------------
// select 文件目录    // 获取编辑框标签列表
const initials = ref<Array<KateFileData>>([]);

const dirArr = ref<Array<KateFileData>>([]);

const removeCurrDir = (curid: number) => {
    // 获取编辑框目录列表
    fetchDirList().then((res: any) => {
        initials.value = res.data.data
        let first: KateFileData = {
            id: '0',
            name: 'root',
            desc: '',
            srcFilename: '',
            url: '',
            createdate: '',
            updatedate: '',
            visitCount: 0,
            dirId: '',
            fileId: '',
            isdocx: 0,
            deleted: 0,
            tagList: []
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

const handlerEdit = (_: string, row: KateFileData) => {
    if (row.isdocx === 0) {
        // handler directory
        dirForm.id = row.id
        dirForm.name = row.name
        dirForm.desc = row.desc
        dirForm.srcFilename = row.srcFilename
        dirForm.dirId = Number(parentId.value)
        dirForm.tags = row.tagList
        dirForm.url = row.url
        isFile.value = false
        isAddContent.value = false
        isEditorable.value = true

        removeCurrDir(Number(row.id))
    } else {
        // handler Package
        loadPkg(row.id).then((res: any) => {
            // set package data, open the edit form
            let pkgData: PackageData = res.data.data
            pkgTableData.pkgid = pkgData.pkgid
            pkgTableData.pkgname = pkgData.pkgname
            pkgTableData.pkgdesc = pkgData.pkgdesc
            pkgTableData.dirid = pkgData.dirid
            pkgTableData.pgm = pkgData.pgm
            isAddContent.value = false
            isEditorablePkg.value = true
        })
        removeCurrDir(-1)
    }
};
// 发送ajax请求修改数据，重新加载界面
const handleClose = () => {
    if (isAddContent.value) {
        if (dirForm.name === '') {
            isEditorable.value = false
            return
        }
        ElMessageBox.confirm("是否确认添加目录?")
            .then(() => {
                addContent({
                    id: Number(dirForm.id),
                    name: dirForm.name,
                    desc: dirForm.desc,
                    dirId: Number(dirForm.dirId),
                }).then(() => {
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
                updateContent({
                    id: Number(dirForm.id),
                    name: dirForm.name,
                    desc: dirForm.desc,
                    dirId: Number(dirForm.dirId),
                }).then(() => {
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
const isFile = ref(false);
const removteData = ref<RemovePkgOrDir>({
    id: -1,
    isdocx: 0,
})

const confirmRemove = async () => {
    // 发送对应的请求删除对应文件
    removteData.value.id = Number(currentId.value)
    removteData.value.isdocx = isFile.value ? 1 : 0
    deletePkgOrDir(removteData.value).then((res: any) => {
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
const handleDelete = (_: number, row: KateFileData) => {
    if (row.isdocx == 0) {
        // if dircetory, need check is empty
        // 获取文件列表
        fetchFileList(row.id).then((res: any) => {
            let fileList: KateFileData[] = res.data.data;
            if (fileList != null && fileList.length > 0) {
                ElMessage({
                    message: `Only delete empty directory ${row.name}!`,
                    type: "warning",
                });
            } else {
                // 渲染内容删除数据
                title.value = `是否确认删除 ${row.name}?`
                currentId.value = row.id
                isFile.value = false
                // 需要判断当前是要删除文件还是目录
                deleteVisible.value = true;
            }
        });
    } else {
        // 渲染内容删除数据
        title.value = `是否确认删除 ${row.name}?`;
        currentId.value = row.id;
        isFile.value = true
        // 需要判断当前是要删除文件还是目录
        deleteVisible.value = true;
    }
};
// ---------------------------数据加载渲染---------------------------
const route = useRoute();
const router = useRouter();
const data = ref<Array<KateFileData>>([]);
let parentId = ref("0");
onBeforeMount(async () => {
    // 如果有就去获取路由中的参数
    if (route.params.id) {
        parentId.value = String(route.params.id)
    }
    // 获取文件列表
    await fetchFileList(parentId.value).then((res: any) => {
        let fileList: KateFileData[] = res.data.data;
        // handler date format
        fileList.forEach((element) => {
            element.createdate = formatDate(element.createdate);
            element.updatedate = formatDate(element.updatedate);
        });
        // handler sort
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
