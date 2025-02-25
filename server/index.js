const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')

///////////////////////////
// Data initialization
///////////////////////////

//TODO: implement (see 6.1.1)
const columns = require('./data/columns.json');
const tags = require('./data/tags.json');
let jsonParser = bodyParser.json()
let taskIdCounter = 0;

///////////////////////////
// Server setup
///////////////////////////

//TODO: implement (see 6.1.2)
const app = express();
const cors = require("cors");
app.use(cors({origin: '*'}));

///////////////////////////
// CRUD operations
///////////////////////////

//TODO: implement (see 6.1.3 - 6.1.9)
app.get('/api/counter', function (req, res) {
    res.status(200);
    res.type('application/json');
    const id = 't' + taskIdCounter
    res.send({ taskIdCounter : id });
});

app.get('/api/tags', function (req, res) {
    res.status(200);
    res.type('application/json');
    res.send(JSON.stringify(tags));
});

app.get('/api/columns', function (req, res) {
    res.status(200);
    res.type('application/json');
    res.send(JSON.stringify(columns));
});

app.post('/api/tasks', jsonParser, function (req, res) {
    const data = req.body;
    let column = getColumnById(data.column);
    if (!column) {
        res.status(401);
        res.send({});
        return;
    }
    taskIdCounter++;
    const idRes = 't' + taskIdCounter
    column.tasks.push({id: idRes, title: data.title, text: data.text, tags: data.taskTags});

    res.status(201);
    res.type('application/json');
    res.send(JSON.stringify({ id : idRes }));
});

app.put('/api/tasks/:id', jsonParser, function (req, res) {
    const id = req.params.id;
    const task = getTaskById(id);
    if (!task) {
        res.status(401);
        res.send({});
        return;
    }
    const data = req.body;
    task.title = data.title;
    task.text = data.text;
    task.tags = data.taskTags;

    res.status(200);
    res.send({});
});

app.delete('/api/tasks/:id', function (req, res) {
    const id = req.params.id;
    const [column, index] = getColumnAndIndexTaskById(id);
    if (!column) {
        res.status(401);
        res.send({});
        return;
    }
    column.tasks.splice(index, 1);
    res.status(200);
    res.send({});
});

app.put('/api/move-task/:id', jsonParser, function (req, res) {
    const id = req.params.id;
    const task = getTaskById(id);
    const [column, index] = getColumnAndIndexTaskById(id);
    const data = req.body;
    const newColumn = getColumnById(data.newColumnId);
    if (!task || !newColumn) {
        res.status(401);
        res.send({});
        return;
    }
    newColumn.tasks.push(task);
    column.tasks.splice(index, 1);

    res.status(200);
    res.send({});
});

function calcTaskIdCounter() {
    for (let column of columns) {
        for (let task of column.tasks) {
            let id = task.id;
            let strNum = id.substring(1, id.length);
            let number = parseInt(strNum);
            if (number > taskIdCounter) {
                taskIdCounter = number;
            }
        }
    }
}

function getColumnById(id) {
    for (let column of columns) {
        if (column.id === id) {
            return column;
        }
    }
    return null;
}

function getTaskById(id) {
    for (let column of columns) {
        for (let task of column.tasks) {
            if (task.id === id) {
                return task;
            }
        }
    }
    return null;
}

function getColumnAndIndexTaskById(id) {
    for (let column of columns) {
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

///////////////////////////
// Start the server
///////////////////////////

//TODO: implement (see 6.1.2)
const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
    calcTaskIdCounter();
    console.log(`Server is running on port ${PORT}`);
});