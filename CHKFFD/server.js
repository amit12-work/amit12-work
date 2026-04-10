const express = require('express');
const path = require('path');
const { getFields, getFieldDetail } = require('./db');

const app = express();
const PORT = 3001;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index', {
        results: [],
        filters: { library: '', file: '', fieldName: '', fieldDesc: '', suffix: '' },
        searched: false,
        message: req.query.error ? 'Error: ' + req.query.error : ''
    });
});

app.get('/search', async (req, res) => {
    const filters = {
        library:   req.query.library   || '',
        file:      req.query.file      || '',
        fieldName: req.query.fieldName || '',
        fieldDesc: req.query.fieldDesc || '',
        suffix:    req.query.suffix    || ''
    };
    try {
        const results = await getFields(
            filters.library, filters.file,
            filters.fieldName, filters.fieldDesc, filters.suffix
        );
        res.render('index', {
            results,
            filters,
            searched: true,
            message: results.length === 0 ? 'No records found.' : ''
        });
    } catch (err) {
        res.render('index', {
            results: [],
            filters,
            searched: true,
            message: 'Error: ' + err.message
        });
    }
});

app.get('/detail', async (req, res) => {
    const { library, file, fieldName } = req.query;
    try {
        const detail = await getFieldDetail(library, file, fieldName);
        if (!detail) {
            return res.redirect('/?error=Field+not+found');
        }
        res.render('detail', { detail });
    } catch (err) {
        res.redirect('/?error=' + encodeURIComponent(err.message));
    }
});

app.listen(PORT, () => {
    console.log(`CHKFFD running on port ${PORT}`);
});
