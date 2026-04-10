const { DBPool } = require('idb-pconnector');

const pool = new DBPool();

const NUMERIC_TYPES = ['SMALLINT', 'NUMERIC', 'INTEGER', 'DECIMAL', 'BIGINT'];

async function getFields(library, file, fieldName, fieldDesc, suffix) {
    let sql = `
        With A1 AS (
            SELECT SYSTEM_TABLE_SCHEMA AS FLDLIB,
                   SYSTEM_TABLE_NAME   AS FLDFILE,
                   SYSTEM_COLUMN_NAME  AS FLDNAME,
                   COALESCE(COLUMN_TEXT, ' ') AS FLDTEXT,
                   DATA_TYPE           AS FLDTYPE,
                   COALESCE(LENGTH, 0) AS FLDDIGIT,
                   COALESCE(NUMERIC_SCALE, 0) AS FLDDECI,
                   SUBSTR(SYSTEM_COLUMN_NAME,
                          LENGTH(TRIM(SYSTEM_COLUMN_NAME)) - 3, 4) AS FLDSFX
            FROM QSYS2.SYSCOLUMNS
        )
        SELECT FLDLIB, FLDFILE, FLDNAME, FLDTEXT, FLDTYPE, FLDDIGIT, FLDDECI, FLDSFX
        FROM A1
        INNER JOIN QSYS2.SYSTABLES
               ON (FLDLIB  = SYSTABLES.SYSTEM_TABLE_SCHEMA
               AND FLDFILE = SYSTABLES.SYSTEM_TABLE_NAME)
        WHERE TABLE_TYPE = 'P'
    `;

    const params = [];

    if (library && library.trim()) {
        sql += ` AND FLDLIB = ?`;
        params.push(library.trim().toUpperCase());
    }
    if (file && file.trim()) {
        sql += ` AND FLDFILE LIKE ?`;
        params.push(file.trim().toUpperCase() + '%');
    }
    if (fieldName && fieldName.trim()) {
        sql += ` AND FLDNAME LIKE ?`;
        params.push(fieldName.trim().toUpperCase() + '%');
    }
    if (fieldDesc && fieldDesc.trim()) {
        sql += ` AND UPPER(FLDTEXT) LIKE ?`;
        params.push('%' + fieldDesc.trim().toUpperCase() + '%');
    }
    if (suffix && suffix.trim()) {
        sql += ` AND FLDSFX LIKE ?`;
        params.push(suffix.trim().toUpperCase() + '%');
    }

    sql += ` ORDER BY ALTEREDTS DESC FETCH FIRST 500 ROWS ONLY`;

    const result = await pool.prepareExecute(sql, params);
    return (result?.resultSet || []).map(row => ({
        ...row,
        FLDLENGTH: NUMERIC_TYPES.includes(row.FLDTYPE)
            ? `${row.FLDDIGIT}, ${row.FLDDECI}`
            : `${row.FLDDIGIT}`
    }));
}

async function getFieldDetail(library, file, fieldName) {
    const sql = `
        With A1 AS (
            SELECT SYSTEM_TABLE_SCHEMA AS FLDLIB,
                   SYSTEM_TABLE_NAME   AS FLDFILE,
                   SYSTEM_COLUMN_NAME  AS FLDNAME,
                   COALESCE(COLUMN_TEXT, ' ') AS FLDTEXT,
                   DATA_TYPE           AS FLDTYPE,
                   COALESCE(LENGTH, 0) AS FLDDIGIT,
                   COALESCE(NUMERIC_SCALE, 0) AS FLDDECI,
                   SUBSTR(SYSTEM_COLUMN_NAME,
                          LENGTH(TRIM(SYSTEM_COLUMN_NAME)) - 3, 4) AS FLDSFX
            FROM QSYS2.SYSCOLUMNS
        )
        SELECT A1.*,
               COALESCE(TABLE_TEXT, ' ') AS FILEDESC
        FROM A1
        INNER JOIN QSYS2.SYSTABLES
               ON (FLDLIB  = SYSTABLES.SYSTEM_TABLE_SCHEMA
               AND FLDFILE = SYSTABLES.SYSTEM_TABLE_NAME)
        WHERE TABLE_TYPE = 'P'
          AND FLDLIB  = ?
          AND FLDFILE = ?
          AND FLDNAME = ?
        FETCH FIRST 1 ROW ONLY
    `;

    const result = await pool.prepareExecute(sql, [
        library.trim().toUpperCase(),
        file.trim().toUpperCase(),
        fieldName.trim().toUpperCase()
    ]);

    const row = result?.resultSet?.[0] || null;
    if (!row) return null;

    return {
        ...row,
        FLDLENGTH: NUMERIC_TYPES.includes(row.FLDTYPE)
            ? `${row.FLDDIGIT}, ${row.FLDDECI}`
            : `${row.FLDDIGIT}`
    };
}

module.exports = { getFields, getFieldDetail };
