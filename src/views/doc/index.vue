<template>
  <div>
    <br />
    <el-row>
      <el-col :span="1"></el-col>
      <el-col :span="11">
        <div class="pagination-block">
          <el-pagination :current-page="currentPage" :page-size="pageSize" :page-sizes="[10, 20, 50, 100]" :disabled="false" :background="true" layout="total, sizes, prev, pager, next, jumper"
            :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>
      </el-col>
      <el-col :span="10"></el-col>
      <el-col :span="2">
        <!--
      <el-input v-model="search" size="small" placeholder="Type to search" />&nbsp;&nbsp;&nbsp;&nbsp;
      -->
        <el-button type="primary" @click="newData()">新增</el-button>
      </el-col>
    </el-row>

    <br />
    <!-- 表格 -->
    <el-table :data="tableData" border style="width: 90%; margin-left: 5%" max-height="800">
      <el-table-column type="index" sortable label="序号" width="120" />
      <el-table-column prop="lang" sortable label="语言" width="120" />
      <el-table-column prop="name" sortable label="语言名称" />
      <el-table-column prop="tips" :show-overflow-tooltip="true" sortable label="提示信息" />
      <el-table-column fixed="right" width="160" align="right" label="操作">
        <template #default="scope">
          <el-button type="primary" @click="showData(scope.$index, scope.row)">
            <el-icon :size="20">
              <Edit />
            </el-icon>
          </el-button>
          <el-button type="danger" @click="deleteData(scope.row)">
            <el-icon :size="20">
              <Delete />
            </el-icon>
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑框 -->
    <el-dialog v-model="dialogFormVisible" align-center :title="formTitle">
      <el-form :model="form">
        <el-form-item label="语言" :label-width="formLabelWidth">
          <el-input v-model="form.lang" placeholder="Please input" />
        </el-form-item>
        <el-form-item label="语言名称" :label-width="formLabelWidth">
          <el-input v-model="form.name" placeholder="Please input" />
        </el-form-item>
        <el-form-item label="代码片段" :label-width="formLabelWidth">
          <el-icon :size="20" :color="activate" @click="copyDocument(form.code)">
            <DocumentCopy />
          </el-icon>
          <el-input v-model="form.code" :rows="20" type="textarea" placeholder="Please input" />
        </el-form-item>
        <el-form-item label="提示信息" :label-width="formLabelWidth">
          <el-input v-model="form.tips" :rows="5" type="textarea" placeholder="Please input" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelEdit()">取消</el-button>
          <el-button type="primary" @click="confirmEdit()">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, reactive, ref } from 'vue';
import { codeCount, deleteCodeTemplate, loadCodeData, saveOrUpdateCodeTemplate } from '../../api/http'
import type { CodeTemplate } from '../../types/test.t';
import type { AxiosResponse } from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
const tableData = ref<Array<CodeTemplate>>([])
// 加载后端数据
onBeforeMount(() => {
  codeCount().then((res: AxiosResponse) => {
    total.value = res.data.total
    loadCodeData(currentPage.value, pageSize.value).then((res: AxiosResponse) => {
      // 直接替换整个数组内容（保持响应性）
      tableData.value = res.data.data
    })
  })
})
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)
const handleSizeChange = (val: number) => {
  loadCodeData(currentPage.value, val).then((res: AxiosResponse) => {
    // 直接替换整个数组内容（保持响应性）
    tableData.value = res.data.data
  })
}
const handleCurrentChange = (val: number) => {
  loadCodeData(val, pageSize.value).then((res: AxiosResponse) => {
    // 直接替换整个数组内容（保持响应性）
    tableData.value = res.data.data
    currentPage.value = val
  })
}

// 编辑
const formTitle = ref('')
const activate = ref('')
// 表单修改页面
const dialogFormVisible = ref(false)
const formLabelWidth = '140px'
const form = reactive({
  id: '',
  lang: '',
  name: '',
  code: '',
  tips: ''
})
const copyDocument = (val: string) => {
  navigator.clipboard.writeText(val)
  activate.value = '#409EFC'
}
const cancelEdit = () => {
  dialogFormVisible.value = false
}
const confirmEdit = () => {
  // 调用保存操作处理数据修改
  saveOrUpdateCodeTemplate(form).then((res: AxiosResponse) => {
    if (res.data.isSuccess) {
      ElMessage({
        type: "success",
        message: "保存成功"
      })
      loadCodeData(currentPage.value, pageSize.value).then((res: AxiosResponse) => {
        // 直接替换整个数组内容（保持响应性）
        tableData.value = res.data.data
      })
      dialogFormVisible.value = false
    } else {
      ElMessage({
        type: "error",
        message: res.statusText
      })
    }
  })
}
// 修改前数据回显
const showData = (_: any, row: any) => {
  formTitle.value = '修改单据'
  form.id = row.id + ''
  form.lang = row.lang
  form.name = row.name
  form.code = row.code
  form.tips = row.tips
  activate.value = ''
  dialogFormVisible.value = true
}

// 新增数据
const newData = () => {
  formTitle.value = '新增单据'
  form.id = ''
  form.lang = ''
  form.name = ''
  form.code = ''
  form.tips = ''
  activate.value = ''
  dialogFormVisible.value = true
}

// 删除数据
const deleteData = (row: any) => {
  // 删除数据
  ElMessageBox.confirm(
    '是否确认删除语言为' + row.lang + '名称为' + row.name + '的数据，?',
    'Warning',
    {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  )
    .then(() => {
      deleteCodeTemplate(row.id).then((res: AxiosResponse) => {
        if (res.data.isSuccess) {
          loadCodeData(currentPage.value, pageSize.value).then((res: AxiosResponse) => {
            tableData.value = res.data.data
          })
          ElMessage({
            type: 'success',
            message: '删除成功',
          })
        }
        else {
          ElMessage({
            type: "error",
            message: res.statusText
          })
        }
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消',
      })
    })



}

</script>

<style scoped>
.el-button--text {
  margin-right: 15px;
}

.el-select {
  width: 300px;
}

.el-input {
  width: 300px;
}

.dialog-footer button:first-child {
  margin-right: 10px;
}


.pagination-block+.pagination-block {
  margin-top: 10px;
}

.pagination-block .demonstration {
  margin-bottom: 16px;
}
</style>
