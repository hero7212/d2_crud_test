<template>
  <div class="d2-crud">
    <!-- 使用方法请参考文档和示例 -->
    <!-- 文档： https://d2-projects.github.io/d2-admin-doc/zh/ecosystem-d2-crud/ -->
    <!-- 示例： https://d2-projects.github.io/d2-admin/#/demo/d2-crud/index -->
    <d2-crud
      ref="d2Crud"
      :columns="columns"
      :data="data"
      title="D2 CRUD"
      selection-row
      add-mode
      add-title="新增"
      edit-title="编辑"
      :add-button="addButton"
      :rowHandle="rowHandle"
      :edit-template="formTemplate"
      :form-rules="formRules"
      :form-options="formOptions"
      :add-template="formTemplate"
      :pagination="pagination"
      @pagination-current-change="paginationCurrentChange"
      @dialog-open="handleDialogOpen"
      @row-add="handleRowAdd"
      @row-edit="handleRowEdit"
      @row-remove="handleRowRemove"
      @dialog-cancel="handleDialogCancel"
      @selection-change="handleSelectionChange">
      <div slot="header" class="crud-header">
        <component v-for="(item, index) in headers" :key="index" :is="item.tag" :placeholder="item.placeholder" clearable @clear="selfEvents[item.clearEvent]()" v-model="search[item.model]">
          <component v-for="(sub, i) in item.child" :is="sub.tag" :key="i" :slot="sub.slot" :class="sub.class" @click="selfEvents[sub.clickEvent]()"></component>
        </component>
        <el-button type="primary" @click="addRow">新增</el-button>
      </div>
    </d2-crud>
  </div>
</template>

<script>
import Vue from 'vue'
import D2Crud from '@d2-projects/d2-crud'
import axios from 'axios'
import request from '@/plugin/axios'

Vue.use(D2Crud)

export default {
  name: 'd2tableChlid',
  data () {
    return {
      apiUrls: {},
      headers: [],
      columns: [],
      data: [],
      addButton: {
        icon: 'el-icon-plus',
        size: 'small'
      },
      search: {
        name: ''
      },
      rowHandle: {},
      formTemplate: {},
      formRules: {
        name: [
          { required: true, message: '请输入报警模板名称', trigger: 'blur' }
        ],
        device_type: [
          { required: true, message: '请选择设备类型', trigger: 'change' }
        ]
      },
      formOptions: {
        labelWidth: '110px',
        labelPosition: 'left',
        saveLoading: false
        // gutter: 20
      },
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      selfEvents: {
        list: () => {
          this.list()
        }
      }
    }
  },
  methods: {
    searchChange (e, model) {
      console.log('云之家上面')
      console.log(e.target.value)
      this[model] = e.target.value
      console.log(this[model])
    },
    paginationCurrentChange (currentPage) {
      this.pagination.currentPage = currentPage
      this.list()
    },
    handleDialogOpen ({ mode }) {
      // this.$message({
      //   message: '打开模态框，模式为：' + mode,
      //   type: 'success'
      // })
    },
    addRow () {
      this.$refs.d2Crud.showDialog({
        mode: 'add'
      })
    },
    async init () {
      let res = await axios({
        url: 'http://127.0.0.1:7001/returnApi',
        method: 'get'
      })
      let { code, data } = res.data
      if (code === 0) {
        this.apiUrls = data
        this.getColumns()
        this.formTemplateIndex()
        this.rowHandleIndex()
        this.headersIndex()
      }
    },
    async handleRowAdd (row, done) {
      this.formOptions.saveLoading = true
      let { code } = await request({
        url: this.apiUrls.addUrl,
        method: 'post',
        data: row
      })
      if (code === 0) {
        this.$message({
          message: '操作成功',
          type: 'success'
        })
        done({
          name: '',
          device_type: ''
        })
        this.list()
        this.formOptions.saveLoading = false
      }
    },
    async handleRowEdit ({ index, row }, done) {
      this.formOptions.saveLoading = true
      let { code } = await request({
        url: `${this.apiUrls.editUrl}/${row.id}`,
        method: 'put',
        data: row
      })
      if (code === 0) {
        this.$message({
          message: '操作成功',
          type: 'success'
        })
        done({
          name: row.name,
          device_type: row.device_type
        })
        this.list()
        this.formOptions.saveLoading = false
      }
    },
    async handleRowRemove ({ index, row }, done) {
      let { code } = await request({
        url: `${this.apiUrls.deleteUrl}/${row.id}`,
        method: 'delete'
      })
      if (code === 0) {
        this.$message({
          message: '操作成功',
          type: 'success'
        })
        done()
        this.list()
      }
    },
    handleDialogCancel (done) {
      this.$message({
        message: '取消保存',
        type: 'warning'
      })
      done({
        name: '',
        device_type: ''
      })
    },
    handleSelectionChange (selection) {
      console.log(selection)
    },
    async list () {
      let { code, data, total } = await request({
        url: this.apiUrls.listUrl,
        method: 'get',
        params: {
          offset: (this.pagination.currentPage - 1) * 10,
          m_category: 0,
          name: this.search.name,
          limit: 10
        }
      })
      if (code === 0) {
        this.data = data.map(item => ({
          forbidEdit: false,
          showEditButton: true,
          forbidRemove: true,
          showRemoveButton: true,
          ...item
        }))
        this.pagination.total = total
      }
    },
    async getColumns () {
      let res = await axios({
        url: this.apiUrls.columnsUrl,
        method: 'get'
      })
      let { code, data } = res.data
      if (code === 0) {
        this.columns = data
        this.list()
      }
    },
    async formTemplateIndex () {
      let res = await axios({
        url: this.apiUrls.formTemplateUrl,
        method: 'get'
      })
      let { code, data } = res.data
      if (code === 0) {
        this.formTemplate = data
      }
    },
    async rowHandleIndex () {
      let res = await axios({
        url: this.apiUrls.rowHandleUrl,
        method: 'get'
      })
      let { code, data } = res.data
      if (code === 0) {
        this.rowHandle = data
      }
    },
    async headersIndex () {
      let res = await axios({
        url: this.apiUrls.headersUrl,
        method: 'get'
      })
      let { code, data } = res.data
      if (code === 0) {
        this.headers = data
      }
    }
  },
  created () {
    this.init()
  }
}

</script>
<style lang="scss">
.crud-header {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
  margin-bottom: 15px;
  padding-right: 20px;
  .el-input {
    width: 220px;
    margin-right: 15px;
  }
  .el-icon-search {
    cursor: pointer;
  }
}
</style>
