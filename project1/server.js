const express = require('express');
const { getTodos, addTodo, deleteTodo } = require('./db');
// const { getTodos, addTodo } = require('./db');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

port = 3031;

app.get('/', async function(req, res) {
    console.log("Todos in GET /:");
    const todos = await getTodos();
    console.log("Todos in GET /:", todos);
    // res.render("index", { todos:todos });
    res.render("index", { todos: todos || [] });
});

app.post('/add', async function(req, res) {
    const todoDesc = req.body.todoDesc
    await addTodo(todoDesc);
    // res.send(`${todoDesc} added`);
    res.redirect('/');
})

app.post('/deleteAll', async function(req, res) {
    console.log("Todo in DeleteAll:");
    await deleteTodo();
    res.redirect('/');
})


app.listen(port, function() {
    console.log(`Server is running on port ${port}`);
});