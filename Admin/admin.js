const data = [
  { id: 1, nama: "YellowFlash", nominal: "Rp. 902.000", rekening: "123456780123456" },
  { id: 2, nama: "Nanda Andika", nominal: "Rp. 40.000", rekening: "1234567890123" },
  { id: 3, nama: "Ghopur", nominal: "Rp. 769.000", rekening: "1234567890" },
  { id: 4, nama: "REZA FAHLEVI", nominal: "Rp. 276.000", rekening: "1234567890123456" },
];

const tbody = document.querySelector("#withdrawTable tbody");
const info = document.getElementById("info");

function loadTable(filter = "") {
  tbody.innerHTML = "";

  const filtered = data.filter(item =>
    item.nama.toLowerCase().includes(filter.toLowerCase())
  );

  filtered.forEach(item => {
    tbody.innerHTML += `
      <tr>
        <td>${item.id}</td>
        <td>${item.nama}</td>
        <td>${item.nominal}</td>
        <td>${item.rekening}</td>
        <td>
          <button class="approve">Approve</button>
          <button class="decline">Decline</button>
        </td>
      </tr>
    `;
  });

  info.textContent = `1 - ${filtered.length} of ${filtered.length}`;
}

loadTable();

// SEARCH
document.getElementById("search").addEventListener("input", function () {
  loadTable(this.value);
});
