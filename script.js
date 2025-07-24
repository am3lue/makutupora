let recruitsData = []; // Store parsed data globally

document.getElementById('upload').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            recruitsData = results.data;
            displayTable(recruitsData);
        }
    });
});

document.getElementById('search').addEventListener('input', function (e) {
    const query = e.target.value.toLowerCase();
    const filtered = recruitsData.filter(row =>
        Object.values(row).some(val =>
            val.toLowerCase().includes(query)
        )
    );
    displayTable(filtered);
});

function displayTable(data) {
    const tableHead = document.querySelector('#output thead');
    const tableBody = document.querySelector('#output tbody');

    if (data.length === 0) {
        tableHead.innerHTML = '';
        tableBody.innerHTML = '<tr><td colspan="4">No records found</td></tr>';
        return;
    }

    const headers = Object.keys(data[0]);
    tableHead.innerHTML = '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
    tableBody.innerHTML = data.map(row =>
        '<tr>' + headers.map(h => `<td>${row[h]}</td>`).join('') + '</tr>'
    ).join('');
}
