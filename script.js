// ============================================================
// 1. SELEKTOR DOM & GLOBAL STATE
// ============================================================
const balance = document.getElementById('balance');
const income = document.getElementById('income');
const expense = document.getElementById('expense');
const list = document.getElementById('list');
const form = document.getElementById('form');
const dateInput = document.getElementById('date');
const typeInput = document.getElementById('type');
const categoryInput = document.getElementById('category');
const amountInput = document.getElementById('amount');
const noteInput = document.getElementById('note');
const filterHistory = document.getElementById('filter-history');
const submitBtn = form.querySelector('button[type="submit"]');
const navDashboard = document.getElementById('nav-dashboard');
const navStats = document.getElementById('nav-stats');
const navGoals = document.getElementById('nav-goals');
const navSettings = document.getElementById('nav-settings');
const viewDashboard = document.getElementById('view-dashboard');
const viewStats = document.getElementById('view-stats');
const viewGoals = document.getElementById('view-goals');
const viewSettings = document.getElementById('view-settings');
const globalPeriodFilter = document.getElementById('global-period-filter');
const trendModeFilter = document.getElementById('trend-mode-filter');
const trendChartTitle = document.getElementById('trend-chart-title');
const adviceText = document.getElementById('financial-advice-text');
const mobileNavDashboard = document.getElementById('mobile-nav-dashboard');
const mobileNavStats = document.getElementById('mobile-nav-stats');
const mobileNavGoals = document.getElementById('mobile-nav-goals');
const mobileNavSettings = document.getElementById('mobile-nav-settings');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebarMenu = document.getElementById('sidebar-menu');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const budgetInput = document.getElementById('budget-input');
const budgetProgress = document.getElementById('budget-progress');
const budgetText = document.getElementById('budget-text');
const goalForm = document.getElementById('goal-form');
const goalsList = document.getElementById('goals-list');

const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const editIdInput = document.getElementById('edit-id');
const editDateInput = document.getElementById('edit-date');
const editTypeInput = document.getElementById('edit-type');
const editCategoryInput = document.getElementById('edit-category');
const editAmountInput = document.getElementById('edit-amount');
const editNoteInput = document.getElementById('edit-note');

const notificationModal = document.getElementById('notification-modal');
const notiTitle = document.getElementById('noti-title');
const notiMessage = document.getElementById('noti-message');
const notiIcon = document.getElementById('noti-icon');
const notiConfirmBtn = document.getElementById('noti-confirm');
const notiCancelBtn = document.getElementById('noti-cancel');

const verifyModal = document.getElementById('verify-modal');
const verifyTitle = document.getElementById('verify-title');
const verifyMessage = document.getElementById('verify-message');
const verifyTargetCode = document.getElementById('verify-target-code');
const verifyInput = document.getElementById('verify-input');
const verifyConfirmBtn = document.getElementById('verify-confirm');
const verifyCancelBtn = document.getElementById('verify-cancel');

const categoryDisplay = document.getElementById('category-display');
const categoryTrigger = document.getElementById('category-trigger');
const editCategoryDisplay = document.getElementById('edit-category-display');
const editCategoryTrigger = document.getElementById('edit-category-trigger');
const catPickerModal = document.getElementById('cat-picker-modal');
const categoryGrid = document.getElementById('category-grid');

/** Global State */
let transactions = [];      // Menyimpan data transaksi di memori (RAM)
let savingGoals = [];       // Menyimpan data tabungan
let monthlyBudget = 0;      // Budget bulanan yang diset
let db;                    // Koneksi IndexedDB
let myIncomeChart = null;   // Instance Chart.js Pemasukan
let myExpenseChart = null;  // Instance Chart.js Pengeluaran
let myTrendChart = null;    // Instance Chart.js Tren Pengeluaran
let currentNotiCallback = null; // Menyimpan aksi yang akan dijalankan setelah konfirmasi pop-up
let currentVerifyCallback = null;
let currentVerifyCode = null;
let isPickingForEdit = false; // Flag untuk menentukan input mana yang sedang diisi
let hasWarnedBudget = false;    // Flag agar peringatan budget tidak muncul terus-menerus

/** Helper: Ambil string YYYY-MM-DD dari objek Date */
/** Helper: Ambil string YYYY-MM-DD sesuai waktu lokal (Mencegah bug UTC) */
const toISODate = (date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
};

const nowInit = new Date();
const currentYear = nowInit.getFullYear();
const currentMonth = String(nowInit.getMonth() + 1).padStart(2, '0');
const lastDayOfMonth = new Date(currentYear, nowInit.getMonth() + 1, 0).getDate();

// Set default tanggal input ke hari ini dan batasi hanya bulan ini
dateInput.valueAsDate = nowInit;
dateInput.min = `${currentYear}-${currentMonth}-01`;
dateInput.max = `${currentYear}-${currentMonth}-${lastDayOfMonth}`;

// Set default global period ke bulan ini
globalPeriodFilter.value = `${currentYear}-${currentMonth}`;

// Batasi filter periode hanya 12 bulan terakhir agar user tidak memilih tanggal terlalu lama
const minDateLimit = new Date();
minDateLimit.setMonth(minDateLimit.getMonth() - 11);
globalPeriodFilter.min = `${minDateLimit.getFullYear()}-${String(minDateLimit.getMonth() + 1).padStart(2, '0')}`;

// ============================================================
// 2. MODAL NOTIFIKASI & KONFIRMASI (CUSTOM POP-UP)
// ============================================================
/**
 * Menampilkan modal pop-up kustom menggantikan alert/confirm bawaan browser.
 */
function showNotification(title, message, type = 'alert', callback = null, confirmText = null) {
    notiTitle.innerText = title;
    notiMessage.innerText = message;
    currentNotiCallback = callback;

    if (type === 'confirm') {
        notiCancelBtn.classList.remove('hidden');
        notiIcon.innerText = '⚠️';
        notiConfirmBtn.innerText = confirmText || 'Hapus';
        
        // Sesuaikan warna jika teksnya "Iya" (untuk menabung) atau "Hapus" (untuk delete)
        if (confirmText === 'Iya') {
            notiConfirmBtn.className = "flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl transition active:scale-95 shadow-lg shadow-indigo-500/20";
        } else {
            notiConfirmBtn.className = "flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-2xl transition active:scale-95 shadow-lg shadow-rose-500/20";
        }
    } else {
        notiCancelBtn.classList.add('hidden');
        notiIcon.innerText = '🔔';
        notiConfirmBtn.innerText = 'Mengerti';
        notiConfirmBtn.className = "flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl transition active:scale-95 shadow-lg shadow-indigo-500/20";
    }

    notificationModal.classList.remove('hidden');
    notificationModal.classList.add('flex');
}

notiConfirmBtn.addEventListener('click', () => {
    notificationModal.classList.add('hidden');
    notificationModal.classList.remove('flex');
    if (currentNotiCallback) currentNotiCallback();
});

notiCancelBtn.addEventListener('click', () => {
    notificationModal.classList.add('hidden');
    notificationModal.classList.remove('flex');
});

/**
 * Menampilkan modal verifikasi keamanan kustom (pengganti prompt)
 */
function verifyAction(title, message, onSuccess) {
    currentVerifyCode = Math.floor(1000 + Math.random() * 9000);
    verifyTitle.innerText = title;
    verifyMessage.innerText = message;
    verifyTargetCode.innerText = currentVerifyCode;
    verifyInput.value = '';
    currentVerifyCallback = onSuccess;

    verifyModal.classList.remove('hidden');
    verifyModal.classList.add('flex');
}

verifyConfirmBtn.addEventListener('click', () => {
    if (verifyInput.value === currentVerifyCode.toString()) {
        verifyModal.classList.add('hidden');
        verifyModal.classList.remove('flex');
        if (currentVerifyCallback) currentVerifyCallback();
    } else {
        showNotification('Gagal', 'Kode keamanan salah.', 'alert');
    }
});

verifyCancelBtn.addEventListener('click', () => {
    verifyModal.classList.add('hidden');
    verifyModal.classList.remove('flex');
});

// ============================================================
// 3. UTILITIES (HELPER FUNCTIONS)
// ============================================================
const getCurrency = () => localStorage.getItem('currency_symbol') || 'Rp';
const formatRupiah = (number) => {
    const symbol = getCurrency();
    const formatted = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(number);
    return `${symbol} ${formatted}`;
};
const formatDateStr = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

/** Data kategori yang tersedia berdasarkan tipe transaksi */
const categoriesData = {
    expense: [
        { val: 'Makan & Minum', text: '🍔 Makanan & Minuman' },
        { val: 'Transportasi', text: '🚌 Transportasi / Bensin' },
        { val: 'Tagihan', text: '📱 Tagihan / Kuota / Listrik' },
        { val: 'Pendidikan', text: '📚 Pendidikan & Keperluan Sekolah' },
        { val: 'Belanja', text: '🛍️ Belanja Kebutuhan' },
        { val: 'Hiburan', text: '🎮 Hiburan & Hobi' },
        { val: 'Kesehatan', text: '💊 Kesehatan' },
        { val: 'Sosial', text: '🤝 Sedekah / Kas' },
        { val: 'Tabungan', text: '🚀 Tabungan' },
        { val: 'Lainnya', text: '✨ Lain-lain' }
    ],
    income: [
        { val: 'Uang Saku', text: '💰 Uang Saku' },
        { val: 'Gaji', text: '💸 Gaji / Pendapatan Sampingan' },
        { val: 'Bonus', text: '🎉 Bonus / THR' },
        { val: 'Pemberian', text: '🎁 Hadiah / Pemberian' },
        { val: 'Investasi', text: '📈 Hasil Investasi' },
        { val: 'Lainnya', text: '✨ Lain-lain' }
    ]
};

/** Logika Smart Budgeting: Periksa limit pengeluaran */
function checkBudgetLimit(expenseTotal) {
    if (monthlyBudget <= 0) return;

    const ratio = expenseTotal / monthlyBudget;
    const percentage = Math.min(ratio * 100, 100);
    
    budgetProgress.style.width = `${percentage}%`;
    
    // Ubah warna bar & teks berdasarkan sisa budget
    if (ratio >= 1) {
        budgetProgress.className = "h-full bg-rose-600 transition-all duration-1000";
        budgetText.innerHTML = `<span class="text-rose-600 font-bold">Anggaran terlampaui! Perhatikan pengeluaranmu.</span>`;
        balance.classList.add('text-rose-600', 'animate-pulse');
    } else if (ratio >= 0.8) {
        budgetProgress.className = "h-full bg-orange-500 transition-all duration-1000";
        budgetText.innerHTML = `<span class="text-orange-500 font-bold">Waspada, pengeluaran mendekati batas anggaran.</span>`;
        if (!hasWarnedBudget) {
            showNotification('Anggaran Menipis', 'Pengeluaranmu sudah mencapai 80% dari target anggaran bulan ini.');
            hasWarnedBudget = true;
        }
    } else {
        budgetProgress.className = "h-full bg-emerald-500 transition-all duration-1000";
        budgetText.innerText = `${Math.round(percentage)}% anggaran telah digunakan.`;
        balance.classList.remove('text-rose-600', 'animate-pulse');
        hasWarnedBudget = false;
    }
}

/** Helper: Menghitung total dari array transaksi berdasarkan kriteria */
function calculateTotal(data, type, period = null) {
    return data
        .filter(t => {
            const matchType = t.type === type;
            const matchPeriod = period ? t.date.startsWith(period) : true;
            return matchType && matchPeriod;
        })
        .reduce((sum, t) => sum + t.amount, 0);
}

/** Helper: Mengubah periode global (bulan) secara programatik */
function setPeriod(newPeriod) {
    if (globalPeriodFilter.value !== newPeriod) {
        globalPeriodFilter.value = newPeriod;
    }
    init();
}

/** Navigasi bulan sebelumnya/berikutnya */
function changeMonth(offset) {
    let currentVal = globalPeriodFilter.value;
    if (!currentVal) {
        const now = new Date();
        currentVal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    const [year, month] = currentVal.split('-').map(Number);
    const targetDate = new Date(year, month - 1 + offset, 1);
    
    const minDate = new Date(globalPeriodFilter.min + '-01');
    const maxDate = new Date();
    maxDate.setDate(1);

    // Pastikan navigasi tidak keluar dari batas 12 bulan terakhir
    if (targetDate >= minDate && targetDate <= maxDate) {
        const formatted = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
        setPeriod(formatted);
    }
}
/** Menghapus filter bulan (Tampilkan semua transaksi) */
function clearPeriodFilter() {
    globalPeriodFilter.value = "";
    init();
}

/** Helper untuk menghancurkan chart jika ada */
function destroyChart(chartInstance) {
    if (chartInstance) chartInstance.destroy();
    return null;
}

/** Mengupdate isi dropdown kategori berdasarkan pilihan tipe (Pemasukan/Pengeluaran) */
 function updateCategoryOptions(typeEl = typeInput, categoryEl = categoryInput) {
     const selectedType = typeEl.value;
     if (!categoriesData[selectedType]) return;
 
     const defaultCat = categoriesData[selectedType][0];
     categoryEl.value = defaultCat.val;
     
     // Update teks tampilan (Label)
     const displayEl = (categoryEl === categoryInput) ? categoryDisplay : editCategoryDisplay;
     if (displayEl) displayEl.innerText = defaultCat.text;
 }
 
 /** Fungsi untuk membuka popup pemilihan kategori */
 function openCategoryPicker(isEdit = false) {
     isPickingForEdit = isEdit;
     const type = isEdit ? editTypeInput.value : typeInput.value;
     renderCategoryGrid(type);
     catPickerModal.classList.remove('hidden');
     catPickerModal.classList.add('flex');
 }
 
 function closeCategoryPicker() {
     catPickerModal.classList.add('hidden');
     catPickerModal.classList.remove('flex');
 }
 
 function renderCategoryGrid(type) {
     categoryGrid.innerHTML = '';
     categoriesData[type].forEach(cat => {
         const btn = document.createElement('button');
         btn.type = "button";
         btn.className = "flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent hover:border-indigo-500 transition-all group active:scale-95";
         
         const emoji = cat.text.split(' ')[0];
         const label = cat.text.replace(emoji + ' ', '');
 
         btn.innerHTML = `
             <span class="text-3xl mb-1 group-hover:scale-110 transition-transform">${emoji}</span>
             <span class="text-[10px] font-bold text-slate-600 dark:text-slate-400 text-center leading-tight">${label}</span>
         `;
         
         btn.onclick = () => {
             const targetInput = isPickingForEdit ? editCategoryInput : categoryInput;
             const targetDisplay = isPickingForEdit ? editCategoryDisplay : categoryDisplay;
             
             targetInput.value = cat.val;
             targetDisplay.innerText = cat.text;
             closeCategoryPicker();
         };
         categoryGrid.appendChild(btn);
     });
 }

// ============================================================
// 4. UI UPDATE FUNCTIONS (DASHBOARD & LOGIC)
// ============================================================
/** Menghitung dan menampilkan Total Saldo, Pemasukan, dan Pengeluaran di UI */
function updateValues() {
    const selectedPeriod = globalPeriodFilter.value;
    
    // Saldo Utama: Akumulasi semua bulan (Global)
    const globalIncome = calculateTotal(transactions, 'income');
    const globalExpense = calculateTotal(transactions, 'expense');
    const totalBalance = globalIncome - globalExpense;

    // Stats per Periode (Bulan yang dipilih)
    const periodIncome = calculateTotal(transactions, 'income', selectedPeriod);
    const periodExpense = calculateTotal(transactions, 'expense', selectedPeriod);

    balance.innerText = formatRupiah(totalBalance);
    income.innerText = `+${formatRupiah(periodIncome)}`;
    expense.innerText = `-${formatRupiah(periodExpense)}`;
    checkBudgetLimit(periodExpense);
    updateGamification();
}

/** Menambah transaksi baru dari formulir dashboard */
function addTransaction(e) {
    e.preventDefault();
    const amountValue = Math.abs(parseFloat(amountInput.value));
    const noteValue = noteInput.value.trim();

    if (isNaN(amountValue) || amountValue <= 0 || noteValue === '' || dateInput.value === '') {
        showNotification('Input Belum Lengkap', 'Pastikan nominal dan keterangan sudah terisi dengan benar.');
        return;
    }

    // Buat objek data transaksi
    const transactionData = {
        id: Date.now(), // Gunakan timestamp agar ID unik
        date: dateInput.value,
        type: typeInput.value,
        category: categoryInput.value,
        amount: amountValue,
        note: noteValue,
    };

    // Simpan ke database asinkronus
    const transaction = db.transaction(['transactions'], 'readwrite');
    const store = transaction.objectStore('transactions');
    const request = store.put(transactionData);

    request.onsuccess = () => {
        transactions.push(transactionData);
        setPeriod(transactionData.date.substring(0, 7)); // Auto switch ke bulan transaksi baru
        
        // Berikan feedback visual kembang api pada tombol atau form
        triggerFireworks(form);
        
        amountInput.value = '';
        noteInput.value = '';
        showNotification('Tersimpan!', 'Catatan keuanganmu telah berhasil dicatat.', 'alert');
    };
}

/** Membuka modal pop-up untuk mengedit data transaksi yang dipilih */
function editTransaction(id) {
    const t = transactions.find(t => t.id === id);
    if(!t) return;
    
    editIdInput.value = t.id;
    editDateInput.value = t.date;
    editTypeInput.value = t.type;
    editCategoryInput.value = t.category;
    
    // Cari label kategori yang sesuai untuk ditampilkan
    const catObj = categoriesData[t.type].find(c => c.val === t.category);
    if (editCategoryDisplay) editCategoryDisplay.innerText = catObj ? catObj.text : t.category;
    
    editAmountInput.value = t.amount;
    editNoteInput.value = t.note;

    editModal.classList.remove('hidden');
    editModal.classList.add('flex');
}
/** Menutup modal edit */
function closeEditModal() {
    editModal.classList.add('hidden');
    editModal.classList.remove('flex');
}

/** Menangani pengiriman data yang sudah diedit dari modal */
function handleEditSubmit(e) {
    e.preventDefault();
    const id = parseInt(editIdInput.value);
    const amountValue = Math.abs(parseFloat(editAmountInput.value));
    
    const updatedData = {
        id: id,
        date: editDateInput.value,
        type: editTypeInput.value,
        category: editCategoryInput.value,
        amount: amountValue,
        note: editNoteInput.value.trim()
    };

    const transaction = db.transaction(['transactions'], 'readwrite');
    const store = transaction.objectStore('transactions');
    const request = store.put(updatedData);

    request.onsuccess = () => {
        transactions = transactions.map(t => t.id === id ? updatedData : t);
        setPeriod(updatedData.date.substring(0, 7)); // Auto switch ke bulan hasil edit
        closeEditModal();
    };
}

/** Menampilkan daftar transaksi (Riwayat) ke dalam HTML */
function renderList() {
    list.innerHTML = '';
    const selectedPeriod = globalPeriodFilter.value;

    // Hitung ambang batas 12 bulan terakhir (Mulai dari tanggal 1 bulan ke-12 yang lalu)
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 11);
    cutoffDate.setDate(1);
    cutoffDate.setHours(0,0,0,0);

    const filtered = transactions
        .filter(t => new Date(t.date) >= cutoffDate) // Batasi transaksi yang bisa dilihat/diubah
        .filter(t => !selectedPeriod || t.date.startsWith(selectedPeriod))
        .filter(t => filterHistory.value === 'all' || t.type === filterHistory.value)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filtered.length === 0) {
        list.innerHTML = '<li class="text-center text-slate-400 py-10 text-sm italic">Belum ada riwayat transaksi di bulan ini.</li>';
        return;
    }

    let lastDate = '';
    filtered.forEach(t => {
        // Daily Grouping Header
        if (t.date !== lastDate) {
            lastDate = t.date;
            const dayHeader = document.createElement('li');
            dayHeader.className = "flex items-center gap-3 my-4";
            dayHeader.innerHTML = `
                <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">${formatDateStr(t.date)}</span>
                <div class="h-[1px] w-full bg-slate-200 dark:bg-slate-800"></div>
            `;
            list.appendChild(dayHeader);
        }

        const isInc = t.type === 'income';
        const item = document.createElement('li');
        item.className = `flex justify-between items-center p-3 bg-white dark:bg-slate-900 rounded-xl border-l-4 ${isInc ? 'border-emerald-400' : 'border-rose-400'} shadow-sm border border-slate-50 dark:border-slate-800 group relative transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50`;
        
        item.innerHTML = `
            <div class="flex flex-col w-2/3">
                <span class="font-bold text-slate-700 dark:text-slate-200 text-sm truncate">${t.note}</span>
                <span class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">${isInc ? '💰' : '💸'} ${t.category}</span>
            </div>
            <div class="flex items-center pr-8">
                <span class="font-bold ${isInc ? 'text-emerald-600' : 'text-rose-600'} text-sm">
                    ${isInc ? '+' : '-'}${formatRupiah(t.amount)}
                </span>
            </div>
            <div class="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onclick="editTransaction(${t.id})" class="bg-amber-400 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-md hover:bg-amber-500">✏️</button>
                <button onclick="removeTransaction(${t.id})" class="bg-rose-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-md hover:bg-rose-600">✕</button>
            </div>
        `;
        list.appendChild(item);
    });
}

/** Menghapus transaksi berdasarkan ID */
 function removeTransaction(id) {
     showNotification('Hapus Data?', 'Data yang dihapus akan mengembalikan saldo utama, dan jika ini transaksi tabungan, progres tabunganmu akan berubah.', 'confirm', () => {
         const tToRemove = transactions.find(t => t.id === id);
         if (!tToRemove) return;
 
         const tx = db.transaction(['transactions', 'goals'], 'readwrite');
         
         // Sinkronisasi dengan target tabungan jika kategori adalah Tabungan atau ada keyword tarik
         if (tToRemove.category === 'Tabungan' || tToRemove.note.includes("Tarik dari tabungan:")) {
             const goalName = tToRemove.note.replace("Menabung untuk: ", "").replace("Auto-Save: ", "").replace("Tarik dari tabungan: ", "");
             const goal = savingGoals.find(g => g.name === goalName);
             
             if (goal) {
                 // Jika hapus pengeluaran menabung -> saved berkurang. Jika hapus pemasukan tarik -> saved bertambah balik.
                 goal.saved += (tToRemove.type === 'expense' ? -tToRemove.amount : tToRemove.amount);
                 tx.objectStore('goals').put(goal);
             }
         }
 
         tx.objectStore('transactions').delete(id);
 
         tx.oncomplete = () => {
             transactions = transactions.filter(t => t.id !== id);
             init();
         }
     });
 }

// ============================================================
// 5. ANALISIS & VISUALISASI DATA (CHART.JS)
// ============================================================
/** Menghitung laporan periodik (Mingguan, Bulanan, Rata-rata) */
function calculatePeriodicReports() {
    const selectedVal = globalPeriodFilter.value;
    const [year, month] = selectedVal.split('-').map(Number);
    
    const monthExpenses = transactions.filter(t => t.type === 'expense' && t.date.startsWith(selectedVal));
    const monthlyTotal = monthExpenses.reduce((sum, t) => sum + t.amount, 0);

    // Tentukan tanggal referensi (hari ini jika bulan saat ini, atau akhir bulan jika bulan lampau)
    const today = new Date();
    let refDate = (today.getFullYear() === year && (today.getMonth() + 1) === month) ? today : new Date(year, month, 0);

    // Hitung Minggu Ini (Senin-Minggu)
    const day = refDate.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const startOfWeek = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate() + diffToMonday).setHours(0,0,0,0);
    const endOfWeek = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate() + diffToMonday + 7).setHours(0,0,0,0);

    const weeklyTotal = monthExpenses
        .filter(t => {
            const d = new Date(t.date).getTime();
            return d >= startOfWeek && d < endOfWeek;
        }).reduce((sum, t) => sum + t.amount, 0);

    const daysPassed = refDate.getDate();
    const dailyAvg = monthlyTotal / daysPassed;

    document.getElementById('stat-weekly-expense').innerText = formatRupiah(weeklyTotal);
    document.getElementById('stat-monthly-expense').innerText = formatRupiah(monthlyTotal);
    document.getElementById('stat-avg-daily').innerText = formatRupiah(Math.round(dailyAvg));
}

/** Analisis Tahunan: Perbandingan & Kategori Terboros */
function calculateAnnualAnalysis() {
    const selectedYear = globalPeriodFilter.value.split('-')[0];
    const lastYear = parseInt(selectedYear) - 1;

    const currentYearExpenses = transactions.filter(t => t.type === 'expense' && t.date.startsWith(selectedYear));
    const lastYearExpenses = transactions.filter(t => t.type === 'expense' && t.date.startsWith(lastYear.toString()));

    const totalCurrent = currentYearExpenses.reduce((sum, t) => sum + t.amount, 0);
    const totalLast = lastYearExpenses.reduce((sum, t) => sum + t.amount, 0);

    const catTotals = {};
    currentYearExpenses.forEach(t => catTotals[t.category] = (catTotals[t.category] || 0) + t.amount);
    const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];

    let msg = `Di tahun ${selectedYear}, lu udah ngeluarin total <b>${formatRupiah(totalCurrent)}</b>. `;
    
    if (totalLast > 0) {
        const diff = totalCurrent - totalLast;
        const pct = Math.abs(Math.round((diff / totalLast) * 100));
        if (diff > 0) {
            msg += `Pengeluaranmu meningkat <b>${pct}%</b> dibanding tahun lalu. Cobalah untuk lebih berhemat di kategori <b>${topCat ? topCat[0] : 'pengeluaran terbesar'}</b>. 🏃‍♂️`;
        } else {
            msg += `Luar biasa! Pengeluaranmu menurun <b>${pct}%</b> dibanding tahun lalu. Pertahankan kebiasaan baik ini! 👏`;
        }
    } else if (topCat) {
        msg += `Kategori pengeluaran terbesarmu tahun ini adalah <b>${topCat[0]}</b>. Perhatikan kembali pengeluaran di bagian ini. 🧐`;
    } else {
        msg = "Belum ada data transaksi yang cukup untuk dianalisis. Yuk, mulai mencatat!";
    }

    adviceText.innerHTML = msg;
}

/** Menghasilkan chart garis untuk tren pengeluaran 7 hari terakhir */
function updateTrendChart() {
    const trendCanvas = document.getElementById('trendChart');
    if (!trendCanvas) return;
    
    const ctxTrend = trendCanvas.getContext('2d');
    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const mode = trendModeFilter.value;
    const [year, month] = globalPeriodFilter.value.split('-').map(Number);
    const monthNamesFull = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    // Pre-filter expenses untuk optimasi
    const expenses = transactions.filter(t => t.type === 'expense');
    const labels = [];
    const totals = [];

    if (mode === 'weekly') {
        trendChartTitle.innerText = 'Tren Pengeluaran 7 Hari Terakhir 📈';
        const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            labels.push(dayNames[d.getDay()]);
            const dateStr = toISODate(d);
            totals.push(expenses.filter(t => t.date === dateStr).reduce((s, t) => s + t.amount, 0));
        }
    } else if (mode === 'monthly') {
        trendChartTitle.innerText = `Tren Pengeluaran Bulan ${monthNamesFull[month - 1]} ${year} 📈`;
        const lastDay = new Date(year, month, 0).getDate();
        for (let i = 1; i <= lastDay; i++) {
            labels.push(i);
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            totals.push(expenses.filter(t => t.date === dateStr).reduce((s, t) => s + t.amount, 0));
        }
    } else {
        trendChartTitle.innerText = `Tren Pengeluaran Tahun ${year} 📈`;
        const mNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        labels.push(...mNames);
        for (let i = 1; i <= 12; i++) {
            const pStr = `${year}-${String(i).padStart(2, '0')}`;
            totals.push(expenses.filter(t => t.date.startsWith(pStr)).reduce((s, t) => s + t.amount, 0));
        }
    }

    myTrendChart = destroyChart(myTrendChart);

    const gradient = ctxTrend.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, isDark ? 'rgba(99, 102, 241, 0.4)' : 'rgba(99, 102, 241, 0.2)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

    myTrendChart = new Chart(ctxTrend, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pengeluaran',
                data: totals,
                borderColor: '#6366f1',
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointBackgroundColor: '#6366f1',
                pointRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${formatRupiah(c.raw)}` } } },
            scales: {
                y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor, font: { size: 10 }, callback: (v) => v >= 1000 ? v / 1000 + 'rb' : v } },
                x: { grid: { display: false }, ticks: { color: textColor, font: { size: 10 } } }
            }
        }
    });
}

/** Menghasilkan analisis visual berupa chart doughnut dan progress bar per kategori */
function updateAnalysis() {
    const incomeSummary = document.getElementById('income-summary');
    const expenseSummary = document.getElementById('expense-summary');
    const ctxIncome = document.getElementById('incomeChart').getContext('2d');
    const ctxExpense = document.getElementById('expenseChart').getContext('2d');
    
    incomeSummary.innerHTML = '';
    expenseSummary.innerHTML = '';

    const selectedPeriod = globalPeriodFilter.value;
    const periodTransactions = transactions.filter(t => t.date.startsWith(selectedPeriod));

    const totalIncome = periodTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = periodTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

    const categories = { income: {}, expense: {} };
    periodTransactions.forEach(t => {
        categories[t.type][t.category] = (categories[t.type][t.category] || 0) + t.amount;
    });

    /** A. Visualisasi Pemasukan */
    const incLabels = Object.keys(categories.income);
    const incData = Object.values(categories.income);
    const incColors = ['#10b981', '#34d399', '#059669', '#6ee7b7', '#047857', '#a7f3d0'];

    if (incData.length === 0) {
        incomeSummary.innerHTML = '<p class="text-[11px] text-emerald-600/60 italic text-center py-2">Belum ada cuan masuk.</p>';
        myIncomeChart = destroyChart(myIncomeChart);
        myIncomeChart = null;
        myIncomeChart = new Chart(ctxIncome, {
            type: 'doughnut', data: { labels: ['Kosong'], datasets: [{ data: [1], backgroundColor: ['#d1fae5'] }] },
            options: { cutout: '75%', plugins: { tooltip: { enabled: false }, legend: { display: false } } }
        });
    } else {
        Object.entries(categories.income).sort((a, b) => b[1] - a[1]).forEach(([cat, amt]) => {
            const pct = totalIncome > 0 ? Math.round((amt / totalIncome) * 100) : 0;
            incomeSummary.innerHTML += `
                <div>
                    <div class="flex justify-between text-[10px] mb-1">
                        <span class="text-slate-600 font-medium">${cat} <span class="text-slate-400">(${pct}%)</span></span>
                        <span class="font-bold text-emerald-600">${formatRupiah(amt)}</span>
                    </div>
                    <div class="w-full bg-emerald-100 rounded-full h-1.5"><div class="bg-emerald-500 h-1.5 rounded-full" style="width: ${pct}%"></div></div>
                </div>`;
        });

        myIncomeChart = destroyChart(myIncomeChart);
        myIncomeChart = new Chart(ctxIncome, {
            type: 'doughnut',
            data: { labels: incLabels, datasets: [{ data: incData, backgroundColor: incColors, borderWidth: 2, borderColor: '#ecfdf5' }] },
            options: { responsive: true, cutout: '70%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${formatRupiah(c.raw)}` } } } }
        });
    }

    /** B. Visualisasi Pengeluaran */
    const expLabels = Object.keys(categories.expense);
    const expData = Object.values(categories.expense);
    const expColors = ['#f43f5e', '#fb7185', '#e11d48', '#fda4af', '#be123c', '#fecdd3', '#f59e0b', '#3b82f6'];

    if (expData.length === 0) {
        expenseSummary.innerHTML = '<p class="text-[11px] text-rose-600/60 italic text-center py-2">Belum ada pengeluaran.</p>';
        myExpenseChart = destroyChart(myExpenseChart);
        myExpenseChart = null;
        myExpenseChart = new Chart(ctxExpense, {
            type: 'doughnut', data: { labels: ['Aman!'], datasets: [{ data: [1], backgroundColor: ['#ffe4e6'] }] },
            options: { cutout: '75%', plugins: { tooltip: { enabled: false }, legend: { display: false } } }
        });
    } else {
        Object.entries(categories.expense).sort((a, b) => b[1] - a[1]).forEach(([cat, amt]) => {
            const pct = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;
            expenseSummary.innerHTML += `
                <div>
                    <div class="flex justify-between text-[10px] mb-1">
                        <span class="text-slate-600 font-medium">${cat} <span class="text-slate-400">(${pct}%)</span></span>
                        <span class="font-bold text-rose-500">${formatRupiah(amt)}</span>
                    </div>
                    <div class="w-full bg-rose-100 rounded-full h-1.5"><div class="bg-rose-500 h-1.5 rounded-full" style="width: ${pct}%"></div></div>
                </div>`;
        });

        myExpenseChart = destroyChart(myExpenseChart);
        myExpenseChart = new Chart(ctxExpense, {
            type: 'doughnut',
            data: { labels: expLabels, datasets: [{ data: expData, backgroundColor: expColors, borderWidth: 2, borderColor: '#fff1f2' }] },
            options: { responsive: true, cutout: '70%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${formatRupiah(c.raw)}` } } } }
        });
    }
}

// ============================================================
// 6. DATABASE PERSISTENCE (INDEXEDDB)
// ============================================================
function initDB() {
    const request = indexedDB.open("SakuTrackerDB", 2); // Naikkan versi untuk store baru
    request.onupgradeneeded = (e) => {
        db = e.target.result;
        if (!db.objectStoreNames.contains('transactions')) {
            db.createObjectStore('transactions', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('budget')) {
            db.createObjectStore('budget', { keyPath: 'month' });
        }
        if (!db.objectStoreNames.contains('goals')) {
            db.createObjectStore('goals', { keyPath: 'id' });
        }
    };
    request.onerror = () => showNotification('Database Error!', 'Gagal akses penyimpanan lokal browser.');
    request.onsuccess = (e) => {
        db = e.target.result;
        loadTransactions();
        loadBudgetData();
        loadGoalsData();
    };
}

/** Load & Save Budget Data */
function loadBudgetData() {
    const month = globalPeriodFilter.value;
    const store = db.transaction(['budget'], 'readonly').objectStore('budget');
    const request = store.get(month);
    request.onsuccess = () => {
        monthlyBudget = request.result ? request.result.amount : 0;
        budgetInput.value = monthlyBudget || '';
        updateValues();
    };
}

budgetInput.addEventListener('change', () => {
    const amount = parseFloat(budgetInput.value) || 0;
    const month = globalPeriodFilter.value;
    const store = db.transaction(['budget'], 'readwrite').objectStore('budget');
    store.put({ month, amount });
    monthlyBudget = amount;
    updateValues();
});

/** Saving Goals Logic */
function loadGoalsData() {
    const store = db.transaction(['goals'], 'readonly').objectStore('goals');
    const request = store.getAll();
    request.onsuccess = () => {
        savingGoals = request.result;
        renderGoalsList();
    };
}

goalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newGoal = {
        id: Date.now(),
        name: document.getElementById('goal-name').value,
        price: parseFloat(document.getElementById('goal-price').value),
        date: document.getElementById('goal-date').value || null,
        saved: 0
    };
    const store = db.transaction(['goals'], 'readwrite').objectStore('goals');
    store.add(newGoal);
    savingGoals.push(newGoal);
    renderGoalsList();
    goalForm.reset();
});

function renderGoalsList() {
    goalsList.innerHTML = '';
    savingGoals.forEach(g => {
        const currentSaved = Math.round(g.saved || 0);
        const targetPrice = Math.round(g.price || 0);
        const isFinished = currentSaved >= targetPrice;
        const pct = isFinished ? 100 : Math.min(Math.round((currentSaved / targetPrice) * 100), 100);
        
        const card = document.createElement('div');
        card.className = `glass-card p-6 rounded-3xl relative overflow-hidden group transition-all duration-500 ${isFinished ? 'border-2 border-emerald-500/50' : ''}`;
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h4 class="font-bold text-slate-700 dark:text-slate-200">${g.name} ${isFinished ? '✅' : ''}</h4>
                    <p class="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Target: ${g.date ? formatDateStr(g.date) : 'Fleksibel'}</p>
                </div>
                <div class="flex gap-2">
                    ${isFinished ? '' : `<button onclick="editGoal(${g.id})" class="text-amber-500 hover:text-amber-600 transition-colors">✏️</button>`}
                    <button onclick="removeGoal(${g.id})" class="text-rose-400 hover:text-rose-600 transition-colors">✕</button>
                </div>
            </div>
            <div class="mb-2 flex justify-between text-xs">
                <span class="font-bold text-indigo-600">${formatRupiah(currentSaved)}</span>
                <span class="text-slate-400">Target: ${formatRupiah(targetPrice)}</span>
            </div>
            <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
                <div class="${isFinished ? 'bg-emerald-500' : 'bg-indigo-500'} h-full transition-all duration-1000" style="width: ${pct}%"></div>
            </div>
             <div class="flex justify-between items-center mt-4">
                 <p class="text-[10px] font-bold text-slate-500">${pct}% Terkumpul</p>
                 <div class="flex gap-1 items-center ${isFinished ? 'hidden' : ''}">
                     <input type="number" id="input-nabung-${g.id}" placeholder="Rp" class="w-16 p-1 text-[10px] border rounded bg-white dark:bg-slate-800 dark:border-slate-700 outline-none">
                     <div class="flex flex-col gap-1">
                        <button onclick="addGoalSaving(${g.id})" class="bg-emerald-500 text-white text-[8px] px-2 py-1 rounded font-bold hover:bg-emerald-600 transition active:scale-90">Nabung</button>
                        <button onclick="withdrawGoalSaving(${g.id})" class="bg-rose-500 text-white text-[8px] px-2 py-1 rounded font-bold hover:bg-rose-600 transition active:scale-90 ${g.saved <= 0 ? 'hidden' : ''}">Tarik</button>
                     </div>
                 </div>
                 ${isFinished ? '<span class="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full">Tercapai! 🎉</span>' : ''}
             </div>
        `;
        goalsList.appendChild(card);
    });
}

 function addGoalSaving(id) {
     const input = document.getElementById(`input-nabung-${id}`);
     let val = parseFloat(input.value);
     if (!val || val <= 0) return;
 
     const currentBalance = parseFloat(balance.innerText.replace(/[^0-9]/g, '')) || 0;
     if (val > currentBalance) {
         showNotification('Saldo Tidak Cukup', `Saldo utama kamu tidak mencukupi untuk menabung sebesar ${formatRupiah(val)}.`, 'alert');
         return;
     }
 
     const goal = savingGoals.find(g => g.id === id);
     if (!goal || goal.saved >= goal.price) return;
 
     const sisaKebutuhan = goal.price - goal.saved;
     if (val > sisaKebutuhan) val = sisaKebutuhan;
 
     showNotification('Konfirmasi Menabung', `Pindahkan ${formatRupiah(val)} ke tabungan "${goal.name}"?`, 'confirm', () => {
         const transactionData = {
             id: Date.now(),
             date: toISODate(new Date()),
             type: 'expense',
             category: 'Tabungan',
             amount: val,
             note: `Menabung untuk: ${goal.name}`,
         };
 
         const tx = db.transaction(['transactions', 'goals'], 'readwrite');
         tx.objectStore('transactions').put(transactionData);
         goal.saved += val;
         tx.objectStore('goals').put(goal);
 
         tx.oncomplete = () => {
             transactions.push(transactionData);
             init(); // Update semua UI secara realtime
             showNotification('Berhasil!', `${formatRupiah(val)} berhasil ditabung.`);
         };
     }, 'Iya');
 }
 
 function withdrawGoalSaving(id) {
     const input = document.getElementById(`input-nabung-${id}`);
     let val = parseFloat(input.value);
     const goal = savingGoals.find(g => g.id === id);
 
     if (!val || val <= 0 || !goal || goal.saved < val) {
         showNotification('Gagal', 'Nominal tidak valid atau saldo tabungan tidak cukup.', 'alert');
         return;
     }
 
     showNotification('Tarik Tabungan', `Kembalikan ${formatRupiah(val)} dari "${goal.name}" ke saldo utama?`, 'confirm', () => {
         const transactionData = {
             id: Date.now(),
             date: toISODate(new Date()),
             type: 'income',
             category: 'Tabungan',
             amount: val,
             note: `Tarik dari tabungan: ${goal.name}`,
         };
 
         const tx = db.transaction(['transactions', 'goals'], 'readwrite');
         tx.objectStore('transactions').put(transactionData);
         goal.saved -= val;
         tx.objectStore('goals').put(goal);
 
         tx.oncomplete = () => {
             transactions.push(transactionData);
             init();
             showNotification('Berhasil!', `${formatRupiah(val)} kembali ke saldo utama.`);
         };
     }, 'Iya');
 }

function editGoal(id) {
    const g = savingGoals.find(goal => goal.id === id);
    if (!g) return;

    document.getElementById('edit-goal-id').value = g.id;
    document.getElementById('edit-goal-name').value = g.name;
    document.getElementById('edit-goal-price').value = g.price;
    document.getElementById('edit-goal-date').value = g.date || '';

    const editGoalModal = document.getElementById('edit-goal-modal');
    editGoalModal.classList.remove('hidden');
    editGoalModal.classList.add('flex');
}

function closeGoalEditModal() {
    const editGoalModal = document.getElementById('edit-goal-modal');
    editGoalModal.classList.add('hidden');
    editGoalModal.classList.remove('flex');
}

function handleGoalEditSubmit(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('edit-goal-id').value);
    const name = document.getElementById('edit-goal-name').value;
    const price = parseFloat(document.getElementById('edit-goal-price').value);
    const date = document.getElementById('edit-goal-date').value || null;

    const store = db.transaction(['goals'], 'readwrite').objectStore('goals');
    const goal = savingGoals.find(g => g.id === id);
    if (goal) {
        goal.name = name;
        goal.price = price;
        goal.date = date;
        store.put(goal);
        renderGoalsList();
        closeGoalEditModal();
        showNotification('Update Berhasil', 'Data target tabunganmu telah diperbarui.');
    }
}

 function removeGoal(id) {
     const goalToDelete = savingGoals.find(g => g.id === id);
     if (!goalToDelete) return;
 
     // Logika status selesai yang presisi
     const currentSaved = Math.round(goalToDelete.saved || 0);
     const targetPrice = Math.round(goalToDelete.price || 0);
     const isFinished = currentSaved >= targetPrice;
 
     const msg = isFinished 
        ? `Hapus target "${goalToDelete.name}"? Karena sudah tercapai, uang yang sudah ditabung tidak akan dikembalikan ke saldo utama.`
        : `Hapus target "${goalToDelete.name}"? Uang yang sudah ditabung (${formatRupiah(currentSaved)}) akan otomatis kembali ke saldo utama.`;

     showNotification('Konfirmasi Hapus', msg, 'confirm', () => {
         const tx = db.transaction(['goals', 'transactions'], 'readwrite');
         const goalStore = tx.objectStore('goals');
         const transStore = tx.objectStore('transactions');
 
         goalStore.delete(id);
         
         if (!isFinished) {
             // Kembalikan saldo: Hapus transaksi pengeluaran (menabung) yang terkait target ini
             const relatedNote = `Menabung untuk: ${goalToDelete.name}`;
             transactions.forEach(t => {
                 if (t.note === relatedNote) transStore.delete(t.id);
             });
         }
 
         tx.oncomplete = () => {
             savingGoals = savingGoals.filter(g => g.id !== id);
             if (!isFinished) {
                 const relatedNote = `Menabung untuk: ${goalToDelete.name}`;
                 transactions = transactions.filter(t => t.note !== relatedNote);
             }
             init(); // Update UI secara realtime (Dashboard & Tabungan)
         };
     });
 }

/** Mengambil data dari IndexedDB saat aplikasi pertama kali dibuka */
function loadTransactions() {
    const transaction = db.transaction(['transactions'], 'readonly');
    const store = transaction.objectStore('transactions');
    const request = store.getAll();
    request.onsuccess = () => {
        transactions = request.result;
        init();
    };
}

// ============================================================
// 7. NAVIGATION & TAB SYSTEM (SPA)
// ============================================================
function switchTab(view) {
    // Tutup sidebar jika sedang terbuka (pada mobile)
    if (sidebarMenu.classList.contains('active')) {
        closeSidebar();
    }

    const views = { dashboard: viewDashboard, stats: viewStats, goals: viewGoals, settings: viewSettings };
    const navs = { dashboard: navDashboard, stats: navStats, goals: navGoals, settings: navSettings };
    const mobileNavs = { dashboard: mobileNavDashboard, stats: mobileNavStats, goals: mobileNavGoals, settings: mobileNavSettings };
    
    // Tambahkan transisi fade out sementara
    const main = document.querySelector('main');
    main.classList.remove('opacity-100');
    main.classList.add('opacity-0');

    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' }); 

        Object.keys(views).forEach(v => {
            const isActive = v === view;
            views[v].classList.toggle('hidden', !isActive);
            
            // Desktop Nav Update (Premium look)
            if (navs[v]) {
                navs[v].className = isActive 
                    ? "px-6 py-2 rounded-xl text-xs font-black transition-all duration-300 bg-white dark:bg-slate-800 shadow-md text-indigo-600 ring-1 ring-black/5"
                    : "px-6 py-2 rounded-xl text-xs font-bold transition-all duration-300 text-slate-400 hover:text-indigo-500";
            }
            
            // Mobile Nav Update
            if (mobileNavs[v]) {
                const mBtn = mobileNavs[v];
                mBtn.classList.toggle('text-indigo-600', isActive);
                mBtn.classList.toggle('bg-indigo-50', isActive);
                mBtn.classList.toggle('dark:bg-indigo-900/20', isActive);
                mBtn.classList.toggle('text-slate-500', !isActive);
            }
        });

        if (view === 'stats') {
            updateAnalysis(); calculatePeriodicReports(); updateTrendChart();
        }
        
        if (view === 'settings') {
            loadSettingsUI();
        }

        // Munculkan kembali dengan animasi
        main.classList.remove('opacity-0');
        main.classList.add('opacity-100');
    }, 200);
}

function openSidebar() {
    sidebarMenu.classList.add('active');
    sidebarOverlay.classList.add('active');
}

function closeSidebar() {
    sidebarMenu.classList.remove('active');
    sidebarOverlay.classList.remove('active');
}

// ============================================================
// 8. FITUR GAMIFIKASI (LEVELING)
// ============================================================
/** Sistem XP berdasarkan jumlah transaksi yang dicatat */
function updateGamification() {
    const count = transactions.length;
    const badge = document.getElementById('badge-level');
    const xpBar = document.getElementById('xp-bar');
    const status = document.getElementById('level-status');

    if (!badge || !xpBar || !status) return;

    // Target maksimal 100% XP = 50 transaksi untuk level awal
    const percentage = Math.min((count / 50) * 100, 100);
    xpBar.style.width = percentage + '%';

    if (count === 0) {
        badge.innerText = '🥚'; status.innerText = 'Telur (Baru Mulai)';
    } else if (count < 10) {
        badge.innerText = '🥉'; status.innerText = 'Pangkat Perunggu';
    } else if (count < 30) {
        badge.innerText = '🥈'; status.innerText = 'Pangkat Perak';
    } else if (count < 300) {
        badge.innerText = '🥇'; status.innerText = 'Pangkat Emas';
    } else {
        badge.innerText = '💎'; status.innerText = 'Sultan Keuangan 👑';
    }
}

// ============================================================
// 9. INITIALIZATION & EVENT LISTENERS
// ============================================================
/** Fungsi utama untuk merender ulang seluruh komponen aplikasi */
function init() {
    updateCategoryOptions(); 
    renderList();
    updateValues();
    updateGamification();
    calculatePeriodicReports();
    calculateAnnualAnalysis();
    renderGoalsList(); // Pastikan list tabungan terupdate setiap kali init dipanggil
    
    // Hanya update chart jika sedang berada di tab statistik
    if(!viewStats.classList.contains('hidden')) {
        updateAnalysis();
        updateTrendChart();
    }
}

/** Registrasi event listener untuk form dan tombol */
form.addEventListener('submit', addTransaction);
editForm.addEventListener('submit', handleEditSubmit);
document.getElementById('close-modal').addEventListener('click', closeEditModal);
document.getElementById('cancel-edit').addEventListener('click', closeEditModal);

document.getElementById('edit-goal-form').addEventListener('submit', handleGoalEditSubmit);
document.getElementById('close-goal-modal').addEventListener('click', closeGoalEditModal);
document.getElementById('cancel-goal-edit').addEventListener('click', closeGoalEditModal);

filterHistory.addEventListener('change', renderList);
globalPeriodFilter.addEventListener('change', init);
trendModeFilter.addEventListener('change', init);
navDashboard.addEventListener('click', () => switchTab('dashboard'));
navStats.addEventListener('click', () => switchTab('stats'));
navGoals.addEventListener('click', () => switchTab('goals'));
navSettings.addEventListener('click', () => switchTab('settings'));
mobileNavDashboard.addEventListener('click', () => switchTab('dashboard'));
mobileNavStats.addEventListener('click', () => switchTab('stats'));
mobileNavGoals.addEventListener('click', () => switchTab('goals'));
mobileNavSettings.addEventListener('click', () => switchTab('settings'));
sidebarToggle.addEventListener('click', openSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

categoryTrigger.addEventListener('click', () => openCategoryPicker(false));
editCategoryTrigger.addEventListener('click', () => openCategoryPicker(true));

typeInput.addEventListener('change', () => updateCategoryOptions(typeInput, categoryInput));
editTypeInput.addEventListener('change', () => updateCategoryOptions(editTypeInput, editCategoryInput));

// Mulai inisialisasi database
initDB();

/** Logika Preloader saat halaman dimuat */
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    const mainContent = document.querySelector('main');
    
    setTimeout(() => {
        preloader.classList.add('opacity-0');
        
        setTimeout(() => {
            preloader.style.display = 'none';
            mainContent.classList.add('animate-fadeInUp');
        }, 500); 
    }, 500); 
});

// ============================================================
// 10. FITUR TAMBAHAN (DARK MODE & EXPORT)
// ============================================================
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const htmlElement = document.documentElement;
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    htmlElement.classList.add('dark');
    themeIcon.textContent = '☀️';
}
themeToggle.addEventListener('click', () => {
    htmlElement.classList.toggle('dark');
    const isDark = htmlElement.classList.contains('dark');
    themeIcon.textContent = isDark ? '☀️' : '🌙';
    if(!viewStats.classList.contains('hidden')) {
        updateAnalysis(); 
        updateTrendChart();
    }
});

/** Ekspor data transaksi ke format CSV (Excel) */
function exportToCSV() {
    if (transactions.length === 0) {
        showNotification('Data Kosong', 'Belum ada data transaksi yang bisa diekspor. Yuk, mulai mencatat!');
        return;
    }

    const headers = ["Tanggal", "Jenis", "Kategori", "Keterangan", "Nominal"];
    const csvRows = [headers.join(',')];

    transactions.forEach(t => {
        const jenis = t.type === 'income' ? 'Pemasukan' : 'Pengeluaran';
        const noteClean = `"${t.note.replace(/"/g, '""')}"`; 
        csvRows.push([t.date, jenis, t.category, noteClean, t.amount].join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `SakuTracker_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ============================================================
// 11. ANIMASI KEMBANG API (FIREWORKS)
// ============================================================
const fireworksCanvas = document.getElementById('fireworks-canvas');
const fireworksCtx = fireworksCanvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Set initial size

function createParticle(x, y, color) {
    return {
        x: x,
        y: y,
        color: color,
        radius: Math.random() * 2 + 1,
        vx: Math.random() * 3 - 1.5,
        vy: Math.random() * -3 - 1,
        alpha: 1,
        gravity: 0.05,
        friction: 0.99,
        decay: Math.random() * 0.015 + 0.005
    };
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= p.decay) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    fireworksCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
    particles.forEach(p => {
        fireworksCtx.beginPath();
        fireworksCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2, false);
        fireworksCtx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha})`;
        fireworksCtx.fill();
    });
}

function animateFireworks() {
    requestAnimationFrame(animateFireworks);
    updateParticles();
    drawParticles();
}

function triggerFireworks(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const colors = [{r: 255, g: 165, b: 0}, {r: 255, g: 255, b: 0}, {r: 0, g: 255, b: 0}, {r: 0, g: 191, b: 255}, {r: 138, g: 43, b: 226}];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    for (let i = 0; i < 50; i++) {
        particles.push(createParticle(centerX, centerY, randomColor));
    }
}

animateFireworks();

// ============================================================
// 12. DATA MANAGEMENT (IMPORT, EXPORT, RESET) + SECURITY
// ============================================================

/** Pengaturan UI & Preferensi */
function loadSettingsUI() {
    document.getElementById('setting-user-name').value = localStorage.getItem('user_name') || '';
    document.getElementById('setting-currency-symbol').value = getCurrency();
}

function savePreferences() {
    const name = document.getElementById('setting-user-name').value;
    const curr = document.getElementById('setting-currency-symbol').value;
    localStorage.setItem('user_name', name);
    localStorage.setItem('currency_symbol', curr);
    showNotification('Tersimpan', 'Preferensi akun kamu berhasil diperbarui.');
    init();
}

/** Eksport semua data ke format JSON */
async function backupDataJSON() {
    const tx = db.transaction(['transactions', 'goals', 'budget'], 'readonly');
    const data = {
        transactions: await new Promise(res => tx.objectStore('transactions').getAll().onsuccess = e => res(e.target.result)),
        goals: await new Promise(res => tx.objectStore('goals').getAll().onsuccess = e => res(e.target.result)),
        budget: await new Promise(res => tx.objectStore('budget').getAll().onsuccess = e => res(e.target.result)),
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SakuTracker_Backup_${toISODate(new Date())}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

/** Import data dari file JSON */
function handleImportJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            if (!importedData.transactions || !importedData.goals) throw new Error("Format file tidak valid.");

            verifyAction(
                'Konfirmasi Import Data',
                'Data yang ada saat ini akan DIGANTI dengan data dari file cadangan. Tindakan ini tidak bisa dibatalkan.',
                () => {
                    const tx = db.transaction(['transactions', 'goals', 'budget'], 'readwrite');
                    
                    // Bersihkan store lama
                    tx.objectStore('transactions').clear();
                    tx.objectStore('goals').clear();
                    tx.objectStore('budget').clear();

                    // Masukkan data baru
                    importedData.transactions.forEach(t => tx.objectStore('transactions').put(t));
                    importedData.goals.forEach(g => tx.objectStore('goals').put(g));
                    if (importedData.budget) {
                        importedData.budget.forEach(b => tx.objectStore('budget').put(b));
                    }

                    tx.oncomplete = () => {
                        showNotification('Import Berhasil', 'Data aplikasi telah diperbarui. Memuat ulang...', 'alert', () => {
                            window.location.reload();
                        });
                    };
                }
            );
        } catch (err) {
            showNotification('Gagal Import', 'File JSON tidak valid atau rusak.', 'alert');
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input file
}

/** Reset total semua data aplikasi */
function resetAllData() {
    verifyAction(
        'RESET TOTAL APLIKASI',
        'Semua transaksi, target tabungan, dan pengaturan akan dihapus secara PERMANEN.',
        () => {
            const tx = db.transaction(['transactions', 'goals', 'budget'], 'readwrite');
            tx.objectStore('transactions').clear();
            tx.objectStore('goals').clear();
            tx.objectStore('budget').clear();

            tx.oncomplete = () => {
                localStorage.clear(); // Bersihkan preferensi lain jika ada
                showNotification('Data Dihapus', 'Aplikasi telah dikosongkan. Memuat ulang...', 'alert', () => {
                    window.location.reload();
                });
            };
        }
    );
}