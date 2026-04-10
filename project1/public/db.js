const { DBPool } = require("idb-pconnector");

async function getTodos() {
    const pool = new DBPool();
    const sql = "SELECT DESC1 FROM AMITN1.TODOS";
    const result = await pool.prepareExecute(sql, [], (err, result) => {
        if (err) {
            console.error("Error executing query:", err);
            return;
        }});l
    console.log("Query result:", result);
        
    return result?.resultSet;
    // return ['1', '2', '3'];
}

async function addTodo(desc) {
    const pool = new DBPool();
    const sql = "INSERT INTO AMITN1.TODOS (DESC1) VALUES (?) WITH NC";

    const params = [desc];
    await pool.prepareExecute(sql, params);
    return true;
    
}

async function deleteTodo() {
    const pool = new DBPool();
    const sql = "DELETE FROM AMITN1.TODOS WITH NC";

    await pool.prepareExecute(sql   );
    return true;
    
}
    
module.exports = {
    getTodos,
    addTodo,
    deleteTodo,
};
            