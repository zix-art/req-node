# req-node 🚀

Modul HTTP(S) request paling simpel, ringan, dan tanpa dependency untuk Node.js. Dibuat untuk performa tinggi dengan ukuran minimalis.

## ✨ Fitur
- **Ultra Lightweight**: Tanpa external dependencies (menggunakan native module).
- **Simpel**: Panggil langsung layaknya `fetch`.
- **Auto-Retry**: Mencoba kembali otomatis jika request gagal.
- **Smart Timeout**: Menghindari request "gantung" terlalu lama.
- **JSON Ready**: Parsing JSON otomatis dengan satu fungsi.

## 📦 Instalasi

```bash
npm install req-node
```

🚀 Cara Penggunaan
Cukup panggil req-node sebagai fungsi:

```
const req = require('req-node');

// Contoh Simple GET
async function getData() {
  try {
    const res = await req('[https://jsonplaceholder.typicode.com/posts/1](https://jsonplaceholder.typicode.com/posts/1)');
    const data = await res.json();
    console.log(data.title);
  } catch (err) {
    console.error("Error nih:", err.message);
  }
}

// Contoh POST dengan Body
async function sendData() {
  const res = await req.post('[https://api.example.com/data](https://api.example.com/data)', {
    nama: 'Biono',
    asal: 'Medan'
  });
  console.log(res.ok ? 'Sukses!' : 'Gagal');
}

getData();
```

⚙️ Opsi Konfigurasi
Kamu bisa menambahkan opsi di parameter kedua:
```bash
await req('[https://api.com](https://api.com)', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer 123' },
  body: { id: 1 },
  timeout: 5000, // 5 detik
  retries: 3     // Coba lagi 3x jika gagal
});
```
