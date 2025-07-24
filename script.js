let recruitsData = [];
let selectedRowIndex = -1;

// Debounce function to limit rapid clicks
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

document.addEventListener('DOMContentLoaded', () => {
  Papa.parse('demo2.csv', {
    download: true,
    header: true,
    skipEmptyLines: true,
    transformHeader: header => header.trim().replace(/^"|"$/g, ''),
    transform: (value, header) => value.trim().replace(/^"|"$/g, ''),
    complete: results => {
      recruitsData = results.data.filter(row => row.Name && row.Company && row.Section && row.Platoon);
      displayTable(recruitsData);
    },
    error: err => console.error('Parse error:', err)
  });

  // Add keyboard event listener for table navigation
  document.addEventListener('keydown', handleKeyNavigation);
});

document.getElementById('upload').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    transformHeader: header => header.trim().replace(/^"|"$/g, ''),
    transform: (value, header) => value.trim().replace(/^"|"$/g, ''),
    complete: function (results) {
      recruitsData = results.data.filter(row => row.Name && row.Company && row.Section && row.Platoon);
      selectedRowIndex = -1; // Reset selection
      displayTable(recruitsData);
    },
    error: err => console.error('Parse error:', err)
  });
});

document.getElementById('search').addEventListener('input', function (e) {
  const query = e.target.value.toLowerCase();
  const filtered = recruitsData.filter(row =>
    Object.values(row).some(val =>
      typeof val === 'string' && val.toLowerCase().includes(query)
    )
  );
  selectedRowIndex = -1; // Reset selection
  displayTable(filtered);
});

function displayTable(data) {
  const tableHead = document.querySelector('#output thead');
  const tableBody = document.querySelector('#output tbody');

  if (!data || data.length === 0) {
    tableHead.innerHTML = '';
    tableBody.innerHTML = '<tr><td colspan="4" class="text-center p-3">No records found</td></tr>';
    return;
  }

  const headers = ['Name', 'Company', 'Section', 'Platoon'];
  tableHead.innerHTML = '<tr>' + headers.map(h => `<th class="p-3 text-left bg-gray-200 dark:bg-gray-700">${h}</th>`).join('') + '</tr>';
  tableBody.innerHTML = data.map((row, index) =>
    `<tr data-index="${index}" class="${index % 2 === 0 ? 'bg-green-500' : 'bg-blue-500'} ${index === selectedRowIndex ? 'selected' : ''} hover:bg-yellow-500 hover:text-black text-white cursor-pointer transition-colors">${headers.map(h => `<td class="p-3">${row[h]}</td>`).join('')}</tr>`
  ).join('');

  // Add click event listeners with debounce
  document.querySelectorAll('#output tbody tr').forEach(tr => {
    tr.addEventListener('click', debounce(function () {
      const i = parseInt(this.getAttribute('data-index'));
      selectedRowIndex = i;
      updateRowSelection();
      showCard(recruitsData[i]);
    }, 200));
  });
}

function updateRowSelection() {
  document.querySelectorAll('#output tbody tr').forEach(tr => {
    const i = parseInt(tr.getAttribute('data-index'));
    if (i === selectedRowIndex) {
      tr.classList.add('selected');
    } else {
      tr.classList.remove('selected');
    }
  });
}

function handleKeyNavigation(e) {
  const tbody = document.querySelector('#output tbody');
  const rows = tbody.querySelectorAll('tr');
  if (!rows.length) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (selectedRowIndex < rows.length - 1) {
      selectedRowIndex++;
      updateRowSelection();
      rows[selectedRowIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (selectedRowIndex > 0) {
      selectedRowIndex--;
      updateRowSelection();
      rows[selectedRowIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  } else if (e.key === 'Enter' && selectedRowIndex >= 0) {
    e.preventDefault();
    showCard(recruitsData[selectedRowIndex]);
  } else if (e.key === 'Escape') {
    e.preventDefault();
    document.getElementById('cardModal').classList.add('hidden');
    selectedRowIndex = -1;
    updateRowSelection();
  }
}

function showCard(recruit) {
  document.getElementById('cardName').textContent = recruit.Name;
  document.getElementById('cardCompany').textContent = recruit.Company;
  document.getElementById('cardSection').textContent = recruit.Section;
  document.getElementById('cardPlatoon').textContent = recruit.Platoon;
  document.getElementById('cardModal').classList.remove('hidden');
}

document.getElementById('closeModal').addEventListener('click', () => {
  document.getElementById('cardModal').classList.add('hidden');
  selectedRowIndex = -1;
  updateRowSelection();
});

document.getElementById('themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});
