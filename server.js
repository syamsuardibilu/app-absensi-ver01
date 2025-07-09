const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { StringDecoder } = require('string_decoder');
const mysql = require('mysql2');

const port = 3000;

// Setup koneksi MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Ganti dengan user MySQL Anda
  password: '', // Ganti dengan password MySQL Anda
  database: 'absensi_db'
});

db.connect((err) => {
  if (err) {
    console.error('Gagal koneksi ke database MySQL:', err);
  } else {
    console.log('Berhasil koneksi ke database MySQL');
  }
});

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  console.log(`Request for ${req.url}`);

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (req.method === 'POST' && pathname === '/api/data-pegawai') {
    // Tangani POST data pegawai
    let buffer = '';
    const decoder = new StringDecoder('utf-8');

    req.on('data', (data) => {
      buffer += decoder.write(data);
    });

    req.on('end', () => {
      buffer += decoder.end();

      try {
        const parsedData = JSON.parse(buffer);
        const pernerList = parsedData.perner; // Array of perner strings

        if (!Array.isArray(pernerList)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Data perner harus berupa array' }));
          return;
        }

        // Insert data perner ke database
        const values = pernerList.map(perner => [perner]);
        const sql = 'INSERT INTO olah_absensi (perner) VALUES ?';

        db.query(sql, [values], (err, result) => {
          if (err) {
            console.error('Error saat insert data:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Gagal menyimpan data ke database: ' + err.message }));
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Data berhasil disimpan', insertedRows: result.affectedRows }));
          }
        });
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'JSON tidak valid' }));
      }
    });
  } else {
    // Serve static files
    let filePath = '.' + pathname;
    if (filePath === './') {
      filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
      if (error) {
        if(error.code == 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found\n');
        }
        else {
          res.writeHead(500);
          res.end('Server Error: ' + error.code + '\n');
        }
      }
      else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  }
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
