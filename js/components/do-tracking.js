/**
 * Delivery Order Tracking Component
 * Komponen untuk menampilkan, mencari, dan menambah tracking delivery order
 */

Vue.component('do-tracking', {
    template: `#tpl-do-tracking`,
    data() {
        return {
            trackingData: [],
            allDeliveryOrders: [],
            upbjjList: [],
            paketList: [],
            pengirimanList: [],
            
            searchQuery: '',
            searchResults: [],
            hasSearched: false,
            
            newDO: {
                nomorDO: '',
                nim: '',
                nama: '',
                ekspedisi: '',
                paket: '',
                tanggalKirim: '',
                total: 0,
                status: 'Dalam Perjalanan',
                perjalanan: []
            },
            
            selectedPaketDetail: null,
            newProgress: {
                keterangan: ''
            },
            doFormErrors: ''
        };
    },
    
    computed: {
        /**
         * Watcher 1: Auto-update nomor DO berdasarkan jumlah data
         */
        nextDONumber() {
            const currentYear = new Date().getFullYear();
            const doCount = this.allDeliveryOrders.length + 1;
            return `DO${currentYear}-${String(doCount).padStart(4, '0')}`;
        }
    },
    
    watch: {
        /**
         * Watcher 1: Update nomor DO saat allDeliveryOrders berubah
         */
        allDeliveryOrders: {
            handler() {
                this.newDO.nomorDO = this.nextDONumber;
            },
            deep: true
        },
        
        /**
         * Watcher 2: Update total harga saat paket dipilih
         */
        'newDO.paket'(newPaket) {
            if (newPaket) {
                const paket = this.paketList.find(p => p.kode === newPaket);
                if (paket) {
                    this.newDO.total = paket.harga;
                }
            }
        }
    },
    
    methods: {
        /**
         * Load data dari API/JSON
         */
        async loadData() {
            try {
                const data = await window.ApiService.fetchData();
                this.upbjjList = data.upbjjList;
                this.paketList = data.paket;
                this.pengirimanList = data.pengirimanList;
                
                // Flatten tracking data dari array of objects
                this.allDeliveryOrders = this.flattenTrackingData(data.tracking);
                this.newDO.nomorDO = this.nextDONumber;
            } catch (error) {
                console.error('Error loading data:', error);
            }
        },
        
        /**
         * Flatten nested tracking object ke array
         */
        flattenTrackingData(trackingArray) {
            const result = [];
            trackingArray.forEach(trackingObj => {
                Object.entries(trackingObj).forEach(([nomorDO, data]) => {
                    result.push({
                        nomorDO: nomorDO,
                        nim: data.nim,
                        nama: data.nama,
                        status: data.status,
                        ekspedisi: data.ekspedisi,
                        tanggalKirim: data.tanggalKirim,
                        paket: data.paket,
                        paketNama: this.getPaketNama(data.paket),
                        total: data.total,
                        perjalanan: JSON.parse(JSON.stringify(data.perjalanan)),
                        expanded: false
                    });
                });
            });
            return result;
        },
        
        /**
         * Dapatkan nama paket berdasarkan kode
         */
        getPaketNama(kodePaket) {
            const paket = this.paketList.find(p => p.kode === kodePaket);
            return paket ? paket.nama : kodePaket;
        },
        
        /**
         * Format currency (Rp)
         */
        formatCurrency(value) {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(value);
        },
        
        /**
         * Format tanggal ke format Indonesia
         */
        formatTanggalIndonesia(dateString) {
            const date = new Date(dateString);
            const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            return `${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
        },
        
        /**
         * Cari DO
         */
        searchDO() {
            this.hasSearched = true;
            if (!this.searchQuery.trim()) {
                this.searchResults = [];
                return;
            }
            
            const query = this.searchQuery.toLowerCase();
            this.searchResults = this.allDeliveryOrders.filter(do => 
                do.nomorDO.toLowerCase().includes(query) || 
                do.nim.includes(query)
            ).map(do => ({
                ...do,
                expanded: false
            }));
        },
        
        /**
         * Clear search
         */
        clearSearch() {
            this.searchQuery = '';
            this.searchResults = [];
            this.hasSearched = false;
            this.newProgress.keterangan = '';
        },
        
        /**
         * Update daftar paket (untuk future enhancement)
         */
        applyPaketList() {
            // Filter paket berdasarkan ekspedisi jika diperlukan
        },
        
        /**
         * Update detail paket yang dipilih
         */
        updatePaketDetail() {
            if (this.newDO.paket) {
                this.selectedPaketDetail = this.paketList.find(p => p.kode === this.newDO.paket);
            } else {
                this.selectedPaketDetail = null;
            }
        },
        
        /**
         * Validasi input DO baru
         */
        validateDO(doData) {
            if (!doData.nim.trim()) return 'NIM harus diisi';
            if (!doData.nama.trim()) return 'Nama harus diisi';
            if (!doData.ekspedisi) return 'Ekspedisi harus dipilih';
            if (!doData.paket) return 'Paket harus dipilih';
            if (!doData.tanggalKirim) return 'Tanggal kirim harus dipilih';
            return null;
        },
        
        /**
         * Tambah delivery order baru
         */
        addDeliveryOrder() {
            this.doFormErrors = '';
            const error = this.validateDO(this.newDO);
            if (error) {
                this.doFormErrors = error;
                return;
            }
            
            const newOrder = {
                nomorDO: this.newDO.nomorDO,
                nim: this.newDO.nim,
                nama: this.newDO.nama,
                status: 'Dalam Perjalanan',
                ekspedisi: this.newDO.ekspedisi,
                tanggalKirim: this.newDO.tanggalKirim,
                paket: this.newDO.paket,
                paketNama: this.selectedPaketDetail.nama,
                total: this.newDO.total,
                perjalanan: [{
                    waktu: this.getCurrentDateTime(),
                    keterangan: 'Penerimaan di sistem'
                }],
                expanded: false
            };
            
            this.allDeliveryOrders.push(newOrder);
            this.resetDOForm();
        },
        
        /**
         * Get current date time
         */
        getCurrentDateTime() {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const date = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
        },
        
        /**
         * Reset form DO
         */
        resetDOForm() {
            this.newDO = {
                nomorDO: this.nextDONumber,
                nim: '',
                nama: '',
                ekspedisi: '',
                paket: '',
                tanggalKirim: '',
                total: 0,
                status: 'Dalam Perjalanan',
                perjalanan: []
            };
            this.selectedPaketDetail = null;
            this.doFormErrors = '';
        },
        
        /**
         * Tambah progress perjalanan
         */
        addProgress(doIndex) {
            if (!this.newProgress.keterangan.trim()) {
                alert('Keterangan progress tidak boleh kosong');
                return;
            }
            
            // Tentukan array mana yang didupdate
            let doItem = null;
            if (this.searchResults.length > 0 && doIndex < this.searchResults.length) {
                doItem = this.searchResults[doIndex];
            } else {
                doItem = this.allDeliveryOrders[doIndex];
            }
            
            if (doItem) {
                doItem.perjalanan.push({
                    waktu: this.getCurrentDateTime(),
                    keterangan: this.newProgress.keterangan
                });
                this.newProgress.keterangan = '';
            }
        }
    },
    
    mounted() {
        this.loadData();
    }
});