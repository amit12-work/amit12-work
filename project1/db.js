const { DBPool } = require("idb-pconnector");

const pool = new DBPool();

async function getTodos() {
    const sql = "SELECT DESC1 FROM AMITN1.TODOS";
    const result = await pool.prepareExecute(sql, []);
    return result?.resultSet;
}

async function addTodo(desc) {
    const sql = "INSERT INTO AMITN1.TODOS (DESC1) VALUES (?) WITH NC";
    await pool.prepareExecute(sql, [desc]);
    return true;
}

async function deleteTodo() {
    const sql = "DELETE FROM AMITN1.TODOS WITH NC";
    await pool.prepareExecute(sql, []);
    return true;
}

async function deleteTodoByDesc(desc) {
    const sql = "DELETE FROM AMITN1.TODOS WHERE DESC1 = ? WITH NC";
    await pool.prepareExecute(sql, [desc]);
    return true;
}

module.exports = {
    getTodos,
    addTodo,
    deleteTodo,
    deleteTodoByDesc,
};
