<!-- todo memo內的樣式 -->
<template lang="">
  <div class="gantt-header">
    <!-- gantt縮放按鈕 -->
    <form class="gantt_control">
      <input type="button" value="縮小" @click="zoomIn()" />
      <input type="button" value="放大" @click="zoomOut()" />

      <input
        type="radio"
        id="scale1"
        class="gantt_radio"
        name="scale"
        value="day"
      />
      <label for="scale1">日</label>

      <input
        type="radio"
        id="scale2"
        class="gantt_radio"
        name="scale"
        value="week"
        checked
      />
      <label for="scale2">週</label>

      <input
        type="radio"
        id="scale3"
        class="gantt_radio"
        name="scale"
        value="month"
      />
      <label for="scale3">月</label>

      <input
        type="radio"
        id="scale4"
        class="gantt_radio"
        name="scale"
        value="quarter"
      />
      <label for="scale4">季</label>

      <input
        type="radio"
        id="scale5"
        class="gantt_radio"
        name="scale"
        value="year"
      />
      <label for="scale5">年</label>
    </form>
    <div class="gantt_control un-redo">
      <input
        value="↩  上一步"
        type="button"
        onclick="gantt.undo()"
        style="margin: 0 15px"
      />
      <input
        value="下一步  ↪"
        type="button"
        onclick="gantt.redo()"
        style="margin: 0 15px"
      />
    </div>
  </div>
  <!-- gantt -->
  <div id="gantt-container"></div>
  <!-- 右側功能按鈕 -->
  <div class="memomode-btn" @click="startMemo">
    <span style="color: red" v-show="todoList.length">* </span>Memo
  </div>
  <div class="export-btn" @click="startExport">Today</div>
  <!-- The Modal -->
  <div id="myModal" class="modal">
    <!-- Modal content for Today -->
    <div class="modal-content" v-show="!isMemo">
      <div class="modal-header">
        <span class="close">&times;</span>
        <h2>今日工作 / 待辦</h2>
      </div>
      <div class="modal-body">
        <div class="export-ul">
          <h3>今日工作:</h3>
          <ol id="today-work" v-show="todayWork.length">
            <li v-for="(item, index) in todayWork" :key="index">
              {{ item }}
            </li>
          </ol>
          <h4
            style="text-align: center; color: #999"
            v-show="!todayWork.length"
          >
            無工作項
          </h4>
        </div>
        <div class="export-ul">
          <h3>待辦事項:</h3>
          <ol id="today-todo" v-show="todayTodo.length">
            <li v-for="(item, index) in todayTodo" :key="index">
              {{ item }}
            </li>
          </ol>
          <h4
            style="text-align: center; color: #999"
            v-show="!todayTodo.length"
          >
            無代辦項
          </h4>
        </div>
      </div>
      <div class="modal-footer">
        <button
          type="button"
          @click="handleCopy('today-work')"
          class="btn-hover color-4"
        >
          複製工作
        </button>
        <button
          type="button"
          @click="handleCopy('today-todo')"
          class="btn-hover color-4"
        >
          複製代辦
        </button>
      </div>
    </div>
    <!-- Modal content for memo -->
    <div class="modal-content" v-show="isMemo">
      <div class="modal-header">
        <span class="close">&times;</span>
        <h2>Memo</h2>
      </div>
      <div class="modal-body">
        <!-- for todoList -->
        <div class="wrapper">
          <div class="inputField">
            <input
              type="text"
              placeholder="請輸入工作，輸入完 Enter即可儲存"
              v-model="todo"
              @keyup.enter="saveToDo"
            />
          </div>
          <ul class="todoList">
            <!-- list區 -->
            <li v-for="(item, index) in todoList" :key="index">
              {{ item.text }}
              <button @click="importJob(item)" class="import-todo">
                匯入工作
              </button>
            </li>
            <h3 style="text-align: center" v-show="!todoList.length">
              尚無事項
            </h3>
          </ul>
          <div class="footer">
            <span v-show="todoList.length"
              >尚有
              <span class="pendingTasks">{{ todoList.length }}</span>
              件工作未匯入</span
            >
            <span v-show="!todoList.length">所有工作皆已匯入</span>
            <button @click="todoAllClear" :class="{ active: todoList.length }">
              全部清除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { onMounted, getCurrentInstance } from 'vue';
import { gantt } from 'dhtmlx-gantt';
export default {
  data() {
    return {
      // gantt資料
      ganttData: {},
      // gantt本地化資料
      locale: {
        date: {
          month_full: [
            '1月',
            '2月',
            '3月',
            '4月',
            '5月',
            '6月',
            '7月',
            '8月',
            '9月',
            '10月',
            '11月',
            '12月'
          ],
          month_short: [
            '1月',
            '2月',
            '3月',
            '4月',
            '5月',
            '6月',
            '7月',
            '8月',
            '9月',
            '10月',
            '11月',
            '12月'
          ],
          day_full: [
            '星期日',
            '星期一',
            '星期二',
            '星期三',
            '星期四',
            '星期五',
            '星期六'
          ],
          day_short: ['日', '一', '二', '三', '四', '五', '六']
        },
        labels: {
          new_task: '新工作',
          dhx_cal_today_button: '今天',
          day_tab: '日',
          week_tab: '週',
          month_tab: '月',
          new_event: '新建工作',
          icon_save: '保存',
          icon_cancel: '關閉',
          icon_details: '詳細',
          icon_edit: '編輯',
          icon_delete: '刪除',
          confirm_closing: '請確認是否撤銷修改!', //Your changes will be lost, are your sure?
          confirm_deleting: '是否刪除工作?',
          section_description: '描述',
          section_time: '預期時程',
          section_type: '類型',

          /* message popup */
          message_ok: '確認',
          message_cancel: '取消',

          /* grid columns */

          column_text: '工作',
          column_start_date: '開始時間',
          column_duration: '持續時間',
          column_add: '',

          /* link confirmation */

          link: '關聯',
          confirm_link_deleting: '將被刪除',
          link_start: ' (開始)',
          link_end: ' (結束)',

          type_task: '工作',
          type_project: '計畫',
          type_milestone: '里程碑',

          minutes: '分鐘',
          hours: '小時',
          days: '天',
          weeks: '週',
          months: '月',
          years: '年'
        }
      },
      // gantt縮放資料
      zoomConfig: {
        levels: [
          {
            name: 'day',
            scale_height: 50,
            min_column_width: 80,
            scales: [{ unit: 'day', step: 1, format: '%M %d' }]
          },
          {
            name: 'week',
            scale_height: 50,
            min_column_width: 50,
            scales: [
              {
                unit: 'week',
                step: 1,
                format: function (date) {
                  let endDate = gantt.date.add(date, +6, 'day');
                  let dateToStr = gantt.date.date_to_str('%M %d');
                  return dateToStr(date) + ' ~ ' + dateToStr(endDate);
                }
              },
              { unit: 'day', step: 1, format: '%j  %D' }
            ]
          },
          {
            name: 'month',
            scale_height: 50,
            min_column_width: 120,
            scales: [
              { unit: 'month', format: '%Y %F' },
              { unit: 'week', format: '第 %W 週' }
            ]
          },
          {
            name: 'quarter',
            height: 50,
            min_column_width: 90,
            scales: [
              { unit: 'month', step: 1, format: '%M' },
              {
                unit: 'quarter',
                step: 1,
                format: function (date) {
                  let dateToStr = gantt.date.date_to_str('%M');
                  let endDate = gantt.date.add(
                    gantt.date.add(date, 3, 'month'),
                    -1,
                    'day'
                  );
                  return dateToStr(date) + ' - ' + dateToStr(endDate);
                }
              }
            ]
          },
          {
            name: 'year',
            scale_height: 50,
            min_column_width: 30,
            scales: [{ unit: 'year', step: 1, format: '%Y' }]
          }
        ]
      },
      // 今天的工作與待辦
      todayWork: [],
      todayTodo: [],
      // modal顯示內容依據
      isMemo: true,
      // 當前todo
      todo: '',
      // 全部todo
      todoList: []
    };
  },
  methods: {
    // 甘特圖縮小
    zoomIn() {
      gantt.ext.zoom.zoomIn();
    },
    // 甘特圖放大
    zoomOut() {
      gantt.ext.zoom.zoomOut();
    },
    //Memo模式啟動按鈕
    startMemo() {
      this.isMemo = true;
      // modal開啟相關
      const modal = document.getElementById('myModal');
      const closeSpan = document.getElementsByClassName('close')[1];
      closeSpan.onclick = function () {
        modal.style.display = 'none';
      };
      modal.style.display = 'flex';
      window.onclick = function (event) {
        if (event.target == modal) {
          modal.style.display = 'none';
        }
      };
      window.onkeyup = function (event) {
        if (event.code === 'Escape') {
          modal.style.display = 'none';
        }
      };
    },
    //Export啟動按鈕
    startExport() {
      this.isMemo = false;
      // modal開啟相關
      const modal = document.getElementById('myModal');
      const closeSpan = document.getElementsByClassName('close')[0];
      closeSpan.onclick = function () {
        modal.style.display = 'none';
      };
      modal.style.display = 'flex';
      window.onclick = function (event) {
        if (event.target == modal) {
          modal.style.display = 'none';
        }
      };
      window.onkeyup = function (event) {
        if (event.code === 'Escape') {
          modal.style.display = 'none';
        }
      };
      // today按鈕操作相關
      this.todayWork = gantt.serialize().data.filter((item) => {
        const start = gantt.date.parseDate(item.start_date);
        const end = gantt.date.parseDate(item.end_date);
        const today = new Date();
        return (
          item.type === 'task' &&
          start <= today &&
          end >= today &&
          item.progress != 0
        );
      });
      this.todayWork = this.todayWork.map((item) => {
        let parent = gantt.getTask(item.parent);
        let grandPa = gantt.getTask(parent.parent);
        let parentText = parent.text + ' ▸ ' || '';
        let grandPaText = grandPa.text + ' ▸ ' || '';
        return grandPaText + parentText + item.text;
      });
      this.todayTodo = gantt.serialize().data.filter((item) => {
        const end = gantt.date.parseDate(item.end_date);
        const today = new Date();
        return item.type === 'task' && end >= today && item.progress != 1;
      });
      this.todayTodo = this.todayTodo.map((item) => {
        let parent = gantt.getTask(item.parent);
        let grandPa = gantt.getTask(parent.parent);
        let parentText = parent.text + ' ▸ ' || '';
        let grandPaText = grandPa.text + ' ▸ ' || '';
        return grandPaText + parentText + item.text;
      });
    },
    //處理點擊複製
    handleCopy(id) {
      const str = document.getElementById(id);
      window.getSelection().selectAllChildren(str);
      document.execCommand('Copy');
      window.getSelection().removeAllRanges();
      gantt.message({
        type: 'info',
        text: '複製成功'
      });
    },
    //todo儲存
    saveToDo() {
      if (!this.todo.trim()) {
        return gantt.message({
          type: 'error',
          text: '請輸入內容'
        });
      }
      this.todoList.push({
        text: this.todo,
        id: new Date().getTime() + Math.floor(Math.random() * 100000)
      });
      localStorage.setItem('todoList', JSON.stringify(this.todoList));
      this.todo = '';
    },
    //todo全部刪除
    todoAllClear() {
      gantt.confirm({
        text: '確認清除全部?',
        ok: '確認',
        cancel: '取消',
        callback: (result) => {
          if (result) {
            this.todoList = [];
            localStorage.setItem('todoList', JSON.stringify(this.todoList));
            gantt.message({
              type: 'info',
              text: '清除成功'
            });
          }
        }
      });
    },
    //todo匯入到甘特圖
    importJob(todo) {
      let taskId = gantt.createTask({
        text: todo.text,
        start_date: new Date(),
        type: 'task',
        isImport: true,
        open: true
      });
      gantt.hideLightbox();
      gantt.showLightbox(taskId);
      this.todoList.forEach((item) => {
        if (item.id === todo.id) {
          item.id = taskId;
        }
      });
      localStorage.setItem('todoList', JSON.stringify(this.todoList));
    },
    //localStorage版本的資料寫入
    updateData() {
      const newDate = gantt.serialize();
      this.ganttData = newDate;
      localStorage.setItem('ganttData', JSON.stringify(newDate));
    }
  },
  setup() {
    onMounted(() => {
      // 取得vue實例data
      const ins = getCurrentInstance();
      // 取得本地todolist
      ins.data.todoList = localStorage.getItem('todoList')
        ? JSON.parse(localStorage.getItem('todoList'))
        : [];
      ins.data.ganttData = localStorage.getItem('ganttData')
        ? JSON.parse(localStorage.getItem('ganttData'))
        : (window.ganttJson ? JSON.parse(window.ganttJson) : {});
      const { locale, zoomConfig } = ins.data;
      // 設定gantt語言
      gantt.i18n.setLocale(locale);
      // 設定gantt上方縮放control
      gantt.ext.zoom.init(zoomConfig);
      gantt.ext.zoom.setLevel('week');
      gantt.ext.zoom.attachEvent('onAfterZoom', function (level, config) {
        document.querySelector(
          ".gantt_radio[value='" + config.name + "']"
        ).checked = true;
      });

      let radios = document.getElementsByName('scale');
      for (let i = 0; i < radios.length; i++) {
        radios[i].onclick = function (event) {
          gantt.ext.zoom.setLevel(event.target.value);
        };
      }
      // 設置左側欄位內容
      gantt.templates.grid_row_class = function (start_date, end_date, item) {
        const css = [];
        if (item.type === 'milestone') return 'hide-add';
        if (item.progress == 0) css.push('red');
        if (item.progress >= 1) css.push('green');
        if (item.$level >= 2) css.push('hide-add');
        if (item.$virtual || !item.$level) css.push('summary-bar');
        return css.join(' ');
      };
      gantt.templates.task_row_class = function (start_date, end_date, item) {
        if (item.type === 'milestone') return;
        if (item.progress == 0) return 'red';
        if (item.progress >= 1) return 'green';
      };
      gantt.config.grid_width = 580;
      gantt.config.columns = [
        { name: 'text', tree: true, width: '*' },
        {
          name: 'start_date',
          align: 'center',
          resize: true
        },
        {
          name: 'duration',
          align: 'center',
          template: function (item) {
            if (item.type === 'milestone') return '';
            return item.duration + ' 天';
          }
        },
        {
          name: 'progress',
          label: '進度',
          width: 80,
          align: 'center',
          template: function (item) {
            if (item.type === 'milestone') return '';
            if (item.progress >= 1) return '✔';
            return Math.round(item.progress * 100) + '%';
          }
        },
        {
          name: 'priority',
          label: '優先度',
          width: 80,
          align: 'center',
          template: function (item) {
            let label = '';
            switch (item.priority) {
              case '3':
                label = '低';
                break;
              case '2':
                label = '中';
                break;
              case '1':
                label = '高';
                break;
            }
            return label;
          }
        },
        {
          name: 'add',
          width: 44
        }
      ];
      // 設置lightbox內容
      gantt.form_blocks['myType'] = {
        render(sns) {
          let height = sns.height || 30;
          return `<div class="gantt_cal_ltext" style="height:${height}px"><select style="width:100%">
          <option value="task">工作</option>
          <option value="project">計畫</option>
          <option value="milestone">里程碑</option>
          </select>
          </div>`;
        },
        set_value(node, value, task) {
          const select = node.firstChild;
          const durationBox =
            document.getElementsByClassName('gantt_duration')[0];
          select.addEventListener('change', function () {
            if (this.value === 'task') {
              durationBox.style.display = 'block';
            } else {
              durationBox.style.display = 'none';
            }
          });
          select.value = task.type || 'task';
          if (select.value === 'task') {
            durationBox.style.display = 'block';
          } else {
            durationBox.style.display = 'none';
          }
        },
        get_value(node) {
          const select = node.firstChild;
          return select.value;
        }
      };
      gantt.locale.labels.section_priority = '優先度';
      gantt.locale.labels.section_open = '展開';
      gantt.locale.labels.section_memo = '備註';
      gantt.locale.labels.section_parent = '附屬於';
      gantt.serverList('priorityOptions', [
        { key: '1', label: '高' },
        { key: '2', label: '中' },
        { key: '3', label: '低' }
      ]);
      gantt.serverList('typeOptions', [
        { key: 'task', label: '工作' },
        { key: 'project', label: '計畫' },
        { key: 'milestone', label: '里程碑' }
      ]);
      const lightboxSection = [
        {
          name: 'description',
          height: 70,
          map_to: 'text',
          type: 'textarea',
          focus: true
        },
        {
          name: 'parent',
          type: 'parent',
          allow_root: 'true',
          root_label: '無附屬',
          filter: function (id, task) {
            if (task.$level > 1) {
              return false;
            } else {
              return true;
            }
          },
          template(start, end, ev) {
            console.log(ev);
            if (ev.$level === 1) {
              return (
                gantt.getTask(gantt.getParent(ev.id)).text + ' ▸ ' + ev.text
              );
            }
            return ev.text;
          }
        },
        {
          name: 'type',
          height: 30,
          map_to: 'type',
          type: 'myType'
        },
        {
          name: 'priority',
          height: 25,
          map_to: 'priority',
          type: 'select',
          options: gantt.serverList('priorityOptions')
        },
        {
          name: 'time',
          type: 'duration',
          map_to: 'auto',
          time_format: ['%Y', '%m', '%d']
        },
        {
          name: 'memo',
          height: 70,
          type: 'textarea',
          map_to: 'memo'
        },
        {
          name: 'open',
          type: 'checkbox',
          map_to: 'open'
        }
      ];
      gantt.config.lightbox.sections = lightboxSection;
      gantt.config.lightbox.milestone_sections = lightboxSection;
      gantt.config.lightbox.project_sections = lightboxSection;
      // 開啟lightbox前的處理
      gantt.attachEvent('onBeforeLightbox', (id) => {
        const nowTask = gantt.getTask(id);
        const isNew = nowTask.$new;
        const isImport = nowTask.isImport;
        const level = nowTask.$level;
        if (isNew && !isImport) {
          nowTask.start_date = new Date();
          nowTask.text = '新工作';
          nowTask.open = true;
        }
        if ((!level || level == 1) && !isImport) {
          nowTask.type = 'project';
        } else {
          nowTask.type = 'task';
        }
        return true;
      });
      // 設置甘特圖表左側內容
      gantt.templates.leftside_text = function (start, end, task) {
        let dateToStr = gantt.date.date_to_str('%M %d');
        let state = gantt.getState(),
          modes = gantt.config.drag_mode;
        if (state.drag_id == task.id) {
          if (
            state.drag_mode == modes.move ||
            (state.drag_mode == modes.resize && state.drag_from_start)
          ) {
            return dateToStr(gantt.roundDate(start));
          }
        }
        if (task.type === 'milestone') return task.text;
        let progressText =
          task.progress == 1 ? '✔' : Math.floor(task.progress * 100) + '%';
        return progressText;
      };
      // 設置甘特圖表右側內容
      gantt.templates.rightside_text = function (start, end, task) {
        let dateToStr = gantt.date.date_to_str('%M %d');
        let state = gantt.getState(),
          modes = gantt.config.drag_mode;

        if (state.drag_id == task.id) {
          if (
            state.drag_mode == modes.move ||
            (state.drag_mode == modes.resize && !state.drag_from_start)
          ) {
            return dateToStr(gantt.roundDate(end));
          }
        }
        if (task.type === 'milestone') return;
        if (task.duration <= 1) {
          return task.text;
        }
      };
      // 依優先級別設定顏色
      gantt.templates.task_class = function (start_date, end_date, item) {
        if (item.type === 'milestone') return;
        if (item.priority === '1') return 'high-priority';
        if (item.priority === '2') return 'normal-priority';
        if (item.priority === '3') return 'low-priority';
      };
      // tooltip功能
      gantt.plugins({
        tooltip: true
      });
      gantt.templates.tooltip_text = (start, end, task) => {
        const isMemo = task.memo ? '<b class="memo">※有備註</b>' : '';
        return task.text + '<br/>' + isMemo;
      };
      // Drag timeline功能 拖曳移動
      gantt.plugins({
        drag_timeline: true
      });
      gantt.config.drag_timeline = {
        ignore: '.gantt_task_line, .gantt_task_link',
        useKey: false
      };
      // lightbox duration旁邊的日期格式
      gantt.templates.task_date = function (date) {
        return (
          date.getFullYear() +
          ' 年 ' +
          (date.getMonth() + 1) +
          ' 月 ' +
          date.getDate() +
          ' 日 '
        );
      };
      gantt.templates.task_time = function (start, end, task) {
        if (task.$new) {
          return gantt.templates.task_date(start);
        }
        return (
          gantt.templates.task_date(start) +
          ' - ' +
          gantt.templates.task_end_date(end)
        );
      };
      // gantt操作資料綁定
      gantt.createDataProcessor({
        task: {
          create: function (data) {
            console.log('新增任務', data);
            // 檢查是否是從memo匯入的任務 是的話要去處理memo
            const id = data.id;
            const newTodoList = ins.data.todoList.filter((item) => {
              if (item.id === id) {
                return false;
              }
              return true;
            });
            ins.data.todoList = newTodoList;
            localStorage.setItem('todoList', JSON.stringify(newTodoList));
            ins.ctx.updateData();
          },
          update: function (data) {
            console.log('更新任務----------------------', data);
            ins.ctx.updateData();
          },
          delete: function (id) {
            console.log('刪除任務----------------------', id);
            ins.ctx.updateData();
          }
        },
        link: {
          create: function (data) {
            console.log('link.create----------------------', data);
            ins.ctx.updateData();
          },
          update: function (data) {
            console.log('link.update----------------------', data);
            ins.ctx.updateData();
          },
          delete: function (id) {
            console.log('link.delete----------------------', id);
            ins.ctx.updateData();
          }
        }
      });
      // 開啟undo功能
      gantt.plugins({
        auto_scheduling: true,
        undo: true
      });
      // 開啟指向今天功能
      gantt.plugins({
        marker: true
      });
      let today = new Date();
      gantt.addMarker({
        start_date: today,
        css: 'today',
        text: 'Now'
      });
      // gantt初始化
      gantt.init('gantt-container');
      if (Object.keys(ins.data.ganttData).length) {
        gantt.parse(ins.data.ganttData);
      }
      // 初始化時讓今天在中間
      gantt.showDate(new Date(new Date().getTime() - 86400000 * 10))
    });
  }
};
</script>
<style>
@import '~dhtmlx-gantt/codebase/dhtmlxgantt.css';
@import '~dhtmlx-gantt/codebase/skins/dhtmlxgantt_material.css';
@import url('https://fonts.googleapis.com/css?family=Roboto:500');
@import url('https://fonts.googleapis.com/css?family=Noto+Sans+TC&subset=chinese-traditional');
#gantt-container {
  height: calc(100vh - 52px);
  width: 100%;
}
/* 第一階字體加粗 */
.summary-bar {
  font-weight: 900 !important;
}
/* today裡的清單樣式 */
.export-ul li {
  margin: 20px 0;
}
/* memo模式按鈕 */
.memomode-btn {
  position: fixed;
  font-family: Roboto;
  color: #333;
  background-color: #f5f850;
  box-shadow: 0 0 10px #f3d42e;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
  cursor: pointer;
  padding: 10px;
  top: 40%;
  right: 0;
}
.memomode-btn:hover {
  background-color: #e1e42d;
  box-shadow: 0 0 10px #6397f7;
  color: #222;
}
/* today按鈕 */
.export-btn {
  position: fixed;
  font-family: 'Noto Sans TC';
  color: #333;
  background-color: #9463f7;
  box-shadow: 0 0 10px #a880f7;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
  cursor: pointer;
  padding: 5px 10px;
  top: 45%;
  right: 0;
}
.export-btn:hover {
  background-color: #8a5de4;
  box-shadow: 0 0 10px #6397f7;
  color: #222;
}
/* lightbox刪除 + border */
.gantt_delete_btn_set {
  border: 1px solid;
}
/* tooltip導圓角 */
.gantt_tooltip {
  border-radius: 10px;
}
/* tooltip備註的樣式 */
.memo {
  color: #bf54e0;
}
/* 隱藏三階任務add按鈕 */
.hide-add .gantt_add {
  display: none;
}
.gantt_task_line.gantt_milestone {
  background-color: #956dd6;
  border: 0 solid #956dd6;
}
.gantt_milestone .gantt_task_content {
  border-radius: 10px !important;
}
.gantt_task_content {
  font-size: 14px !important;
  color: #fff !important;
  text-shadow: 1px 1px 1px #666;
  width: 100% !important;
  top: 0 !important;
  cursor: pointer !important;
  position: absolute !important;
  white-space: nowrap !important;
  text-align: center !important;
}
/* 依級別區分顏色 */
.high-priority {
  background-color: #f8aa50 !important;
  border-color: #f8aa50 !important;
}
.high-priority .gantt_task_progress {
  background-color: #ee952e !important;
}
.normal-priority {
  background-color: #428afe !important;
  border-color: #428afe !important;
}
.normal-priority .gantt_task_progress {
  background-color: #3975d9 !important;
}
.low-priority {
  background-color: #1cddad !important;
  border-color: #1cddad !important;
}
.low-priority .gantt_task_progress {
  background-color: #19c69b !important;
}
.red .gantt_cell,
.odd.red .gantt_cell,
.red .gantt_task_cell,
.odd.red .gantt_task_cell {
  background-color: #fde0e0;
}

.green .gantt_cell,
.odd.green .gantt_cell,
.green .gantt_task_cell,
.odd.green .gantt_task_cell {
  background-color: #bee4be;
}
* {
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font: 'Noto Sans TC';
}

.gantt_control {
  background: #ededed;
  text-align: center;
  padding: 10px 0 12px;
}

.gantt_control input[type='button'],
.gantt_control input[type='file'],
.gantt_control input[type='checkbox'],
.gantt_control button {
  font: 900 14px 'Noto Sans TC';
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  background: #fff;
  padding: 4px 12px;
  margin: 0 5px;
  color: rgba(0, 0, 0, 0.7);
  line-height: 20px;
}

.gantt_control input[type='button']:hover,
.gantt_control button:hover {
  border: 1px solid #b3b3b3;
  color: rgba(0, 0, 0, 0.8);
  cursor: pointer;
}

.gantt_control input[type='button']:active,
.gantt_control button:active {
  background: #f7f7f7;
}

.gantt_control input[type='button']:focus,
.gantt_control button:focus {
  outline: none !important;
}

.gantt_control input[type='radio'],
.gantt_control input[type='checkbox'] {
  display: none;
}

.gantt_control label {
  padding: 0 6px;
  color: rgba(0, 0, 0, 0.54);
  font: 500 14px Noto Sans TC;
  line-height: 20px;
  letter-spacing: 0.2px;
}

.material-icons {
  position: relative;
  top: 6px;
  right: 2px;
  color: rgba(0, 0, 0, 0.54);
}

.material-icons.icon_color {
  color: #0288d1;
}

.material-icons.md-inactive {
  color: rgba(0, 0, 0, 0.38);
}

.checked_label {
  color: rgba(0, 0, 0, 0.7) !important;
}

.gantt_radio:checked,
.gantt_radio:not(:checked) {
  position: absolute;
  left: -9999px;
}
.gantt_radio:checked + label,
.gantt_radio:not(:checked) + label {
  position: relative;
  padding-left: 28px;
  cursor: pointer;
  line-height: 20px;
  display: inline-block;
  color: #666;
}
.gantt_radio:checked + label:before,
.gantt_radio:not(:checked) + label:before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 18px;
  height: 18px;
  border: 1px solid #ddd;
  border-radius: 100%;
  background: #fff;
}
.gantt_radio:checked + label:after,
.gantt_radio:not(:checked) + label:after {
  content: '';
  width: 12px;
  height: 12px;
  background: #8a9ada;
  position: absolute;
  top: 4px;
  left: 4px;
  border-radius: 100%;
  -webkit-transition: all 0.2s ease;
  transition: all 0.2s ease;
}
.gantt_radio:not(:checked) + label:after {
  opacity: 0;
  -webkit-transform: scale(0);
  transform: scale(0);
}
.gantt_radio:checked + label:after {
  opacity: 1;
  -webkit-transform: scale(1);
  transform: scale(1);
}
/* modal */
/* Modal Header */
.modal-header {
  padding: 2px 16px;
  background-color: #6422eb;
  color: white;
  border-bottom: 1px solid #d7d7d7;
  box-shadow: 0 1px 2px 0rgba (0, 0, 0, 0.2), 0 2px 3px 0 rgba(0, 0, 0, 0.1);
  border-top-right-radius: 20px;
  border-top-left-radius: 20px;
}
.modal-header h2 {
  text-align: center;
}
/* Modal Body */
.modal-body {
  padding: 2px 16px;
  display: flex;
  justify-content: space-around;
}

/* Modal Footer */
.modal-footer {
  padding: 0px 16px;
  color: white;
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #d7d7d7;
  box-shadow: 0 -1px 2px 0rgba (0, 0, 0, 0.2), 0 2px 3px 0 rgba(0, 0, 0, 0.1);
}
/* The Modal (background) */
.modal {
  display: none; /* Hidden by default */
  position: fixed; /* Stay in place */
  z-index: 1; /* Sit on top */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgb(0, 0, 0); /* Fallback color */
  background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
  -webkit-animation-name: fadeIn; /* Fade in the background */
  -webkit-animation-duration: 0.4s;
  animation-name: fadeIn;
  animation-duration: 0.4s;
  justify-content: center;
}

/* Modal Content */
.modal-content {
  position: fixed;
  bottom: 0;
  background-color: #fefefe;
  width: 50%;
  -webkit-animation-name: slideIn;
  -webkit-animation-duration: 0.4s;
  animation-name: slideIn;
  animation-duration: 0.4s;
  border-radius: 30px 30px 10px 10px;
  box-shadow: 0 3px 7px rgba(0, 0, 0, 0.3);
}

/* The Close Button */
.close {
  color: white;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: #000;
  text-decoration: none;
  cursor: pointer;
}

/* Add Animation */
@-webkit-keyframes slideIn {
  from {
    bottom: -300px;
    opacity: 0;
  }
  to {
    bottom: 0;
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    bottom: -300px;
    opacity: 0;
  }
  to {
    bottom: 0;
    opacity: 1;
  }
}

@-webkit-keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.buttons {
  margin: 10%;
  text-align: center;
}

.btn-hover {
  width: 150px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  margin: 10px;
  height: 45px;
  text-align: center;
  border: none;
  background-size: 300% 100%;
  border-radius: 20px;
  transition: all 0.4s ease-in-out;
}

.btn-hover:hover {
  background-position: 100% 0;
  transition: all 0.4s ease-in-out;
}

.btn-hover:focus {
  outline: none;
}
.btn-hover.color-4 {
  background-image: linear-gradient(
    to right,
    #fc6076,
    #ff9a44,
    #ef9d43,
    #e75516
  );
  box-shadow: 0 4px 15px 0 rgba(252, 104, 110, 0.75);
}
/* toDoList */
.wrapper {
  background: #fff;
  width: 100%;
  margin: 0;
  border-radius: 5px;
}
.wrapper header {
  font-size: 30px;
  font-weight: 600;
}
.wrapper .inputField {
  margin: 20px 0;
  width: 100%;
  display: flex;
  height: 45px;
}
.inputField input {
  width: 100%;
  height: 100%;
  outline: none;
  border-radius: 3px;
  border: 1px solid #ccc;
  font-size: 17px;
  padding-left: 15px;
  transition: all 0.3s ease;
}
.inputField input:focus {
  border-color: #6600eb;
}
.inputField button {
  width: 50px;
  height: 100%;
  border: none;
  color: #fff;
  margin-left: 5px;
  font-size: 21px;
  outline: none;
  background: #6600eb;
  cursor: pointer;
  border-radius: 3px;
  opacity: 0.6;
  pointer-events: none;
  transition: all 0.3s ease;
}
.inputField button:hover,
.footer button:hover {
  background: #6600eb;
}
.inputField button.active {
  opacity: 1;
  pointer-events: auto;
}
.wrapper .todoList {
  max-height: 250px;
  padding: 0;
  overflow-y: auto;
}
.todoList li {
  position: relative;
  list-style: none;
  margin-bottom: 8px;
  background: #f2f2f2;
  border-radius: 3px;
  padding: 10px 15px;
  cursor: default;
  overflow: hidden;
  word-wrap: break-word;
}
.todoList li .import-todo {
  position: absolute;
  right: -100px;
  top: 50%;
  transform: translateY(-50%);
  background: #e74c3c;
  width: 100px;
  text-align: center;
  color: #fff;
  padding: 5px;
  border-radius: 15px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}
.todoList li:hover .import-todo {
  right: 20px;
}
.wrapper .footer {
  display: flex;
  width: 100%;
  margin: 20px 0;
  align-items: center;
  justify-content: space-between;
}
.footer button {
  padding: 6px 10px;
  border-radius: 3px;
  border: none;
  outline: none;
  color: #fff;
  font-weight: 400;
  font-size: 16px;
  margin-left: 5px;
  background: #6600eb;
  cursor: pointer;
  user-select: none;
  opacity: 0.6;
  pointer-events: none;
  transition: all 0.3s ease;
}
.footer button.active {
  opacity: 1;
  pointer-events: auto;
}
/* header */
.gantt-header {
  display: flex;
  justify-content: space-between;
  background-color: #ededed;
}
/* 好看scrollbar */
::-webkit-scrollbar {
  width: 5px;
}
::-webkit-scrollbar-track {
  -webkit-border-radius: 10px;
  border-radius: 10px;
  margin: 80px 0 5px 0;
}
::-webkit-scrollbar-thumb {
  -webkit-border-radius: 4px;
  border-radius: 4px;
  background: rgb(219, 219, 219);
}
/* Now flag樣式 */
.today {
  background-color: #d266f3cb;
}
.gantt_marker_content {
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
  border-bottom-left-radius: 10px;
}
</style>
