const express = require('express');
const { getTodos, addTodo, deleteTodo, deleteTodoByDesc } = require('./db');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

const port = 3031;

app.get('/', async function(req, res) {
    const todos = await getTodos();
    res.render("index", { todos: todos || [] });
});

app.post('/add', async function(req, res) {
    const todoDesc = req.body.todoDesc;
    if (!todoDesc || todoDesc.trim().length === 0 || todoDesc.trim().length > 255) {
        return res.redirect('/');
    }
    await addTodo(todoDesc.trim());
    res.redirect('/');
});

app.post('/delete', async function(req, res) {
    const todoDesc = req.body.todoDesc;
    await deleteTodoByDesc(todoDesc);
    res.redirect('/');
});

app.post('/deleteAll', async function(req, res) {
    await deleteTodo();
    res.redirect('/');
});

app.listen(port, function() {
    console.log(`Server is running on port ${port}`);
});
