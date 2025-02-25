<script setup>
import { ref, onMounted } from 'vue'
import Board from './components/Board.vue'
import Header from '@/components/Header.vue'
import Modal from '@/components/Modal.vue'

const tags = ref([])
const columns = ref([])
const modalRef = ref(null)

const title = 'My Kanban Board'

/**
 * Calls the showModal() function in Modal.vue, assuming the component is registered and referenced.
 * DO NOT MODIFY.
 */
function showModal(task = null, columnId = null) {
    if (modalRef.value) {
        modalRef.value.showModal(task, columnId)
    }
}

/**
 * Calls showModal() in editing mode.
 * DO NOT MODIFY.
 * @param taskId
 */
function triggerEdit(taskId) {
    for (let column of columns.value) {
        const index = column.tasks.findIndex(t => t.id === taskId)
        if (index > -1) {
            const task = column.tasks[index]
            showModal(task)
            return
        }
    }
}

////////////////////////////////////////////////////////////////
// API calls below, only modify the content of the functions, not their signature! //
////////////////////////////////////////////////////////////////

async function loadTags() {
  //TODO: implement (see 6.2 / 6.1.4)
  fetch('http://localhost:3000/api/tags')
      .then(response => response.json())
      .then(data => {
        tags.value = data
      })
      .catch(error => {
      });
}

async function loadColumns() {
  //TODO: implement (see 6.2 / 6.1.5)
  fetch('http://localhost:3000/api/columns')
      .then(response => response.json())
      .then(data => {
        columns.value = data
      })
      .catch(error => {
      });
}

async function createTask(columnId, taskTitle, taskText, taskTags) {
    //TODO: implement (see 6.2 / 6.1.6)
  fetch('http://localhost:3000/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type' : 'application/json' },
    body: JSON.stringify({ "column": columnId, "title": taskTitle, "text": taskText, "taskTags": taskTags }),
  })
      .then(response => response.json())
      .then(data => {
        let column = getColumnById(columnId);
        let val = {id: data.id, title: taskTitle, text: taskText, tags: taskTags};
        column.tasks.push(val);
      })
      .catch(error => {
      });
}

async function editTask(taskId, taskTitle, taskText, taskTags) {
    //TODO: implement (see 6.2 / 6.1.7)
  fetch('http://localhost:3000/api/tasks/' + taskId, {
    method: 'PUT',
    headers: { 'Content-Type' : 'application/json' },
    body: JSON.stringify({ "title": taskTitle, "text": taskText, "taskTags": taskTags }),
  })
      .then(response => response.json())
      .then(data => {
        let task = getTaskById(taskId);
        task.title = taskTitle;
        task.text = taskText;
        task.tags = taskTags;
      })
      .catch(error => {
      });
}

async function deleteTask(taskId) {
    //TODO: implement (see 6.2 / 6.1.8)
  fetch('http://localhost:3000/api/tasks/' + taskId, {
    method: 'DELETE',
    headers: { 'Content-Type' : 'application/json' },
    body: JSON.stringify({}),
  })
      .then(response => response.json())
      .then(data => {
        const [column, index] = getColumnAndIndexTaskById(taskId);
        column.tasks.splice(index, 1);
      })
      .catch(error => {
      });
}

async function moveTask(taskId, newColumnId) {
    //TODO: implement (see 6.2 / 6.1.9)
  fetch('http://localhost:3000/api/move-task/' + taskId, {
    method: 'PUT',
    headers: { 'Content-Type' : 'application/json' },
    body: JSON.stringify({ "newColumnId": newColumnId }),
  })
      .then(response => response.json())
      .then(data => {
        const task = getTaskById(taskId);
        const [column, index] = getColumnAndIndexTaskById(taskId);
        const newColumn = getColumnById(newColumnId);
        newColumn.tasks.push(task);
        column.tasks.splice(index, 1);
      })
      .catch(error => {
      });
}

function getColumnById(id) {
  for (let column of columns.value) {
    if (column.id === id) {
      return column;
    }
  }
  return null;
}

function getTaskById(id) {
  for (let column of columns.value) {
    for (let task of column.tasks) {
      if (task.id === id) {
        return task;
      }
    }
  }
  return null;
}

function getColumnAndIndexTaskById(id) {
  for (let column of columns.value) {
    let index = 0;
    for (let task of column.tasks) {
      if (task.id === id) {
        return [column, index];
      }
      index++;
    }
  }
  return [null, -1];
}

onMounted(() => {
    // DO NOT MODIFY
    loadTags()
    loadColumns()
})
</script>

<template>
    <!-- DO NOT MODIFY -->
    <Header :title="title" @show-modal="showModal" />
    <Board :columns="columns" @move-task="moveTask" @trigger-edit="triggerEdit" @delete-task="deleteTask"/>
    <Modal :tags="tags" :columns="columns" ref="modalRef" @create-task="createTask" @edit-task="editTask"/>
</template>