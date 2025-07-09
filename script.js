// Status validasi untuk setiap input
let validationStatus = {
    dataPegawai: false,
    dataHariLibur: false,
    ciCoDaily: false,
    attAbsDaily: false,
    attAbs: false,
    attSap: false,
    sppdUmum: false,
    workSchedule: false,
    substitutionDaily: false,
    substitutionSap: false
};

// Fungsi untuk mengecek data
function cekData(inputId) {
    const textarea = document.getElementById(inputId);
    const resultBox = document.getElementById(`result-${inputId}`);
    const inputSection = textarea.closest('.input-section');
    const cekButton = inputSection.querySelector('.btn-cek');

    // Jika inputId adalah dataPegawai, maka tombol CEK diubah menjadi SUBMIT dan data dikirim ke server
    if (inputId === 'dataPegawai') {
        cekButton.textContent = 'SUBMIT';
        cekButton.disabled = true;
        resultBox.className = 'result-box info';
        resultBox.textContent = 'Mengirim data ke server...';

        const pernerData = textarea.value.trim();
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        if (pernerData === '') {
            resultBox.className = 'result-box error';
            resultBox.textContent = 'Error: Data tidak boleh kosong!';
            validationStatus[inputId] = false;
            inputSection.classList.remove('validated');
            cekButton.textContent = 'SUBMIT';
            cekButton.disabled = false;
            updateSubmitButton();
            return;
        }

        if (!startDate || !endDate) {
            resultBox.className = 'result-box error';
            resultBox.textContent = 'Error: Start Date dan End Date harus diisi!';
            validationStatus[inputId] = false;
            inputSection.classList.remove('validated');
            cekButton.textContent = 'SUBMIT';
            cekButton.disabled = false;
            updateSubmitButton();
            return;
        }

        // Pisahkan data perner menjadi array
        const pernerList = pernerData.split('\n').map(line => line.trim()).filter(line => line !== '');

        // Kirim data ke backend
        fetch('/api/data-pegawai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ perner: pernerList, startDate: startDate, endDate: endDate })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                resultBox.className = 'result-box error';
                resultBox.textContent = `✗ ${data.error}`;
                validationStatus[inputId] = false;
                inputSection.classList.remove('validated');
            } else {
                resultBox.className = 'result-box success';
                resultBox.textContent = `✓ ${data.message} (Baris: ${pernerList.length})`;
                validationStatus[inputId] = true;
                inputSection.classList.add('validated');
            }
            cekButton.textContent = 'SUBMIT';
            cekButton.disabled = false;
            updateSubmitButton();
        })
        .catch(error => {
            resultBox.className = 'result-box error';
            resultBox.textContent = `✗ Gagal mengirim data: ${error.message}`;
            validationStatus[inputId] = false;
            inputSection.classList.remove('validated');
            cekButton.textContent = 'SUBMIT';
            cekButton.disabled = false;
            updateSubmitButton();
        });

        return;
    }

    // Untuk input lain, proses validasi lokal seperti sebelumnya
    // Tambahkan loading state
    cekButton.classList.add('loading');
    cekButton.disabled = true;

    // Reset result box
    resultBox.className = 'result-box';
    resultBox.textContent = 'Memproses...';

    // Simulasi proses validasi (dalam implementasi nyata, ini bisa berupa API call)
    setTimeout(() => {
        const data = textarea.value.trim();

        if (data === '') {
            // Data kosong
            resultBox.className = 'result-box error';
            resultBox.textContent = 'Error: Data tidak boleh kosong!';
            validationStatus[inputId] = false;
            inputSection.classList.remove('validated');
        } else {
            // Validasi berdasarkan jenis data
            const validationResult = validateDataByType(inputId, data);

            if (validationResult.isValid) {
                resultBox.className = 'result-box success';
                resultBox.textContent = `✓ ${validationResult.message}`;
                validationStatus[inputId] = true;
                inputSection.classList.add('validated');
            } else {
                resultBox.className = 'result-box error';
                resultBox.textContent = `✗ ${validationResult.message}`;
                validationStatus[inputId] = false;
                inputSection.classList.remove('validated');
            }
        }

        // Hapus loading state
        cekButton.classList.remove('loading');
        cekButton.disabled = false;

        // Update status tombol submit
        updateSubmitButton();
    }, 1000); // Simulasi delay 1 detik
}

// Fungsi untuk menghapus data
function hapusData(inputId) {
    const textarea = document.getElementById(inputId);
    const resultBox = document.getElementById(`result-${inputId}`);
    const inputSection = textarea.closest('.input-section');
    
    // Konfirmasi sebelum menghapus
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
        textarea.value = '';
        resultBox.className = 'result-box';
        resultBox.textContent = '';
        validationStatus[inputId] = false;
        inputSection.classList.remove('validated');
        
        // Update status tombol submit
        updateSubmitButton();
        
        // Fokus ke textarea
        textarea.focus();
    }
}

// Fungsi validasi berdasarkan jenis data
function validateDataByType(inputId, data) {
    const lines = data.split('\n').filter(line => line.trim() !== '');
    const lineCount = lines.length;
    
    switch (inputId) {
        case 'dataPegawai':
            return validateDataPegawai(data, lineCount);
        case 'dataHariLibur':
            return validateDataHariLibur(data, lineCount);
        case 'ciCoDaily':
            return validateCiCoDaily(data, lineCount);
        case 'attAbsDaily':
            return validateAttAbsDaily(data, lineCount);
        case 'attAbs':
            return validateAttAbs(data, lineCount);
        case 'attSap':
            return validateAttSap(data, lineCount);
        case 'sppdUmum':
            return validateSppdUmum(data, lineCount);
        case 'workSchedule':
            return validateWorkSchedule(data, lineCount);
        case 'substitutionDaily':
            return validateSubstitutionDaily(data, lineCount);
        case 'substitutionSap':
            return validateSubstitutionSap(data, lineCount);
        default:
            return { isValid: false, message: 'Jenis data tidak dikenali' };
    }
}

// Fungsi validasi spesifik untuk setiap jenis data
function validateDataPegawai(data, lineCount) {
    // Validasi sederhana: minimal 1 baris, mengandung informasi pegawai
    if (lineCount < 1) {
        return { isValid: false, message: 'Data pegawai minimal harus memiliki 1 baris' };
    }
    
    // Cek apakah mengandung format yang mirip data pegawai (contoh: NIK, nama, dll)
    const hasValidFormat = data.toLowerCase().includes('nik') || 
                          data.toLowerCase().includes('nama') || 
                          data.toLowerCase().includes('id');
    
    if (hasValidFormat) {
        return { isValid: true, message: `Data pegawai valid (${lineCount} baris data)` };
    } else {
        return { isValid: false, message: 'Format data pegawai tidak valid' };
    }
}

function validateDataHariLibur(data, lineCount) {
    // Validasi format tanggal
    const datePattern = /\d{1,2}[-\/]\d{1,2}[-\/]\d{4}|\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/;
    const hasDateFormat = datePattern.test(data);
    
    if (hasDateFormat) {
        return { isValid: true, message: `Data hari libur valid (${lineCount} hari libur)` };
    } else {
        return { isValid: false, message: 'Format tanggal hari libur tidak valid' };
    }
}

function validateCiCoDaily(data, lineCount) {
    // Validasi data check in/check out
    const hasTimeFormat = /\d{1,2}:\d{2}/.test(data);
    
    if (hasTimeFormat && lineCount > 0) {
        return { isValid: true, message: `Data CI CO Daily valid (${lineCount} record)` };
    } else {
        return { isValid: false, message: 'Format waktu CI CO tidak valid' };
    }
}

function validateAttAbsDaily(data, lineCount) {
    if (lineCount > 0) {
        return { isValid: true, message: `Data ATT ABS Daily valid (${lineCount} record)` };
    } else {
        return { isValid: false, message: 'Data ATT ABS Daily kosong' };
    }
}

function validateAttAbs(data, lineCount) {
    if (lineCount > 0) {
        return { isValid: true, message: `Data ATT ABS valid (${lineCount} record)` };
    } else {
        return { isValid: false, message: 'Data ATT ABS kosong' };
    }
}

function validateAttSap(data, lineCount) {
    if (lineCount > 0) {
        return { isValid: true, message: `Data ATT SAP valid (${lineCount} record)` };
    } else {
        return { isValid: false, message: 'Data ATT SAP kosong' };
    }
}

function validateSppdUmum(data, lineCount) {
    if (lineCount > 0) {
        return { isValid: true, message: `Data SPPD Umum valid (${lineCount} record)` };
    } else {
        return { isValid: false, message: 'Data SPPD Umum kosong' };
    }
}

function validateWorkSchedule(data, lineCount) {
    const hasScheduleFormat = data.toLowerCase().includes('shift') || 
                             data.toLowerCase().includes('jadwal') ||
                             /\d{1,2}:\d{2}/.test(data);
    
    if (hasScheduleFormat && lineCount > 0) {
        return { isValid: true, message: `Data Work Schedule valid (${lineCount} jadwal)` };
    } else {
        return { isValid: false, message: 'Format jadwal kerja tidak valid' };
    }
}

function validateSubstitutionDaily(data, lineCount) {
    if (lineCount > 0) {
        return { isValid: true, message: `Data Substitution Daily valid (${lineCount} record)` };
    } else {
        return { isValid: false, message: 'Data Substitution Daily kosong' };
    }
}

function validateSubstitutionSap(data, lineCount) {
    if (lineCount > 0) {
        return { isValid: true, message: `Data Substitution SAP valid (${lineCount} record)` };
    } else {
        return { isValid: false, message: 'Data Substitution SAP kosong' };
    }
}

// Fungsi untuk mengupdate status tombol submit
function updateSubmitButton() {
    const submitBtn = document.getElementById('submitBtn');
    const allValid = Object.values(validationStatus).every(status => status === true);
    
    if (allValid) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'SUBMIT';
        submitBtn.style.background = 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)';
    } else {
        submitBtn.disabled = true;
        submitBtn.textContent = 'SUBMIT (Lengkapi semua validasi)';
        submitBtn.style.background = '#cccccc';
    }
}

// Event listener untuk form submit
document.getElementById('absensiForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    
    // Cek sekali lagi apakah semua data valid
    const allValid = Object.values(validationStatus).every(status => status === true);
    
    if (!allValid) {
        alert('Pastikan semua data sudah divalidasi dan berstatus hijau!');
        return;
    }
    
    // Tampilkan loading
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    submitBtn.textContent = 'MEMPROSES...';
    
    // Simulasi proses submit (dalam implementasi nyata, ini akan mengirim data ke server)
    setTimeout(() => {
        alert('Data berhasil disubmit! Semua data absensi telah diproses.');
        
        // Reset form jika diperlukan
        if (confirm('Apakah Anda ingin mereset form untuk input data baru?')) {
            resetForm();
        }
        
        // Hapus loading
        submitBtn.classList.remove('loading');
        updateSubmitButton();
    }, 2000);
});

// Fungsi untuk mereset form
function resetForm() {
    // Reset semua textarea
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.value = '';
    });
    
    // Reset semua result box
    const resultBoxes = document.querySelectorAll('.result-box');
    resultBoxes.forEach(box => {
        box.className = 'result-box';
        box.textContent = '';
    });
    
    // Reset semua input section
    const inputSections = document.querySelectorAll('.input-section');
    inputSections.forEach(section => {
        section.classList.remove('validated');
    });
    
    // Reset validation status
    Object.keys(validationStatus).forEach(key => {
        validationStatus[key] = false;
    });
    
    // Update submit button
    updateSubmitButton();
}

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    updateSubmitButton();
    
    // Tambahkan event listener untuk auto-resize textarea
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.max(120, this.scrollHeight) + 'px';
        });
    });
});
