/**
 * Stock Table Component
 * Komponen utama untuk menampilkan, filter, sort, dan CRUD stok bahan ajar
 */

Vue.component('ba-stock-table', {
    template: `#tpl-stock-table`,
    data() {
        return {
            stokData: [],
            upbjjList: [],
            kategoriList: [],
            paketList: [],
            pengirimanList: [],
            
            filters: {
                upbjj: '',
                kategori: '',
                reorderOnly: false,
                sortBy: ''
            },
            
            newItem: {
                kode: '',
                judul: '',
                kategori: '',
                upbjj: '',
                lokasiRak: '',
                harga: 0,
                qty: 0,
                safety: 0,
                catatanHTML: ''
            },
            
            editingId: null,
            editingItem: {},
            formErrors: '',
            searchQuery: ''
        };
    },
    
    computed: {
        /**
         * Filter kategori berdasarkan UPBJJ yang dipilih (dependent filtering)
         */
        availableKategori() {
            if (!this.filters.upbjj) return [];
            const kategoriSet = new Set();
            this.stokData
                .filter(item => item.upbjj === this.filters.upbjj)
                .forEach(item => kategoriSet.add(item.kategori));
            return Array.from(kategoriSet);
        },
        
        /**
         * Data yang sudah difilter dan di-sort
         */
        filteredData() {
            let filtered = this.stokData;
            
            // Filter berdasarkan UPBJJ
            if (this.filters.upbjj) {
                filtered = filtered.filter(item => item.upbjj === this.filters.upbjj);
            }
            
            // Filter berdasarkan Kategori
            if (this.filters.kategori) {
                filtered = filtered.filter(item => item.kategori === this.filters.kategori);
            }
            
            // Filter berdasarkan Re-order Alert (qty <= safety)
            if (this.filters.reorderOnly) {
                filtered = filtered.filter(item => item.qty <= item.safety);
            }
            
            // Sort
            if (this.filters.sortBy === 'judul') {
                filtered = filtered.sort((a, b) => a.judul.localeCompare(b.judul));
            } else if (this.filters.sortBy === 'qty') {
                filtered = filtered.sort((a, b) => a.qty - b.qty);
            } else if (this.filters.sortBy === 'harga') {
                filtered = filtered.sort((a, b) => a.harga - b.harga);
            }
            
            return filtered;
        },
        
        /**
         * Total harga dari data yang terfilter
         */
        totalHarga() {
            return this.filteredData.reduce((sum, item) => sum + (item.harga * item.qty), 0);
        }
    },
    
    methods: {
        /**
         * Load data dari API/JSON
         */
        async loadData() {
            try {
                const data = await window.ApiService.fetchData();
                this.stokData = JSON.parse(JSON.stringify(data.stok)); // Deep copy
                this.upbjjList = data.upbjjList;
                this.kategoriList = data.kategoriList;
                this.paketList = data.paket;
                this.pengirimanList = data.pengirimanList;
            } catch (error) {
                console.error('Error loading data:', error);
            }
        },
        
        /**
         * Apply filter tanpa recompute (menggunakan computed properties)
         */
        applyFilters() {
            // Reactive data binding otomatis trigger computed properties
        },
        
        /**
         * Reset semua filter
         */
        resetFilters() {
            this.filters = {
                upbjj: '',
                kategori: '',
                reorderOnly: false,
                sortBy: ''
            };
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
         * Validasi input form
         */
        validateItem(item) {
            if (!item.kode.trim()) return 'Kode harus diisi';
            if (!item.judul.trim()) return 'Judul harus diisi';
            if (!item.kategori) return 'Kategori harus dipilih';
            if (!item.upbjj) return 'UT-Daerah harus dipilih';
            if (!item.lokasiRak.trim()) return 'Lokasi Rak harus diisi';
            if (item.harga <= 0) return 'Harga harus lebih dari 0';
            if (item.qty < 0) return 'Qty tidak boleh negatif';
            if (item.safety < 0) return 'Safety stock tidak boleh negatif';
            
            // Check duplicate kode
            if (this.stokData.some(data => data.kode === item.kode && data.kode !== this.editingId)) {
                return 'Kode sudah ada';
            }
            
            return null;
        },
        
        /**
         * Tambah item baru
         */
        addItem() {
            this.formErrors = '';
            const error = this.validateItem(this.newItem);
            if (error) {
                this.formErrors = error;
                return;
            }
            
            this.stokData.push(JSON.parse(JSON.stringify(this.newItem)));
            this.resetNewItemForm();
        },
        
        /**
         * Reset form tambah item
         */
        resetNewItemForm() {
            this.newItem = {
                kode: '',
                judul: '',
                kategori: '',
                upbjj: '',
                lokasiRak: '',
                harga: 0,
                qty: 0,
                safety: 0,
                catatanHTML: ''
            };
            this.formErrors = '';
        },
        
        /**
         * Mulai edit item
         */
        startEdit(item) {
            this.editingId = item.kode;
            this.editingItem = JSON.parse(JSON.stringify(item));
        },
        
        /**
         * Simpan edit item
         */
        saveEdit() {
            const error = this.validateItem(this.editingItem);
            if (error) {
                alert(error);
                return;
            }
            
            const index = this.stokData.findIndex(item => item.kode === this.editingId);
            if (index !== -1) {
                this.$set(this.stokData, index, JSON.parse(JSON.stringify(this.editingItem)));
            }
            this.cancelEdit();
        },
        
        /**
         * Batal edit
         */
        cancelEdit() {
            this.editingId = null;
            this.editingItem = {};
        },
        
        /**
         * Konfirmasi delete
         */
        confirmDelete(item) {
            this.$root.showDeleteConfirm(item.judul, () => this.deleteItem(item.kode));
        },
        
        /**
         * Hapus item
         */
        deleteItem(kode) {
            const index = this.stokData.findIndex(item => item.kode === kode);
            if (index !== -1) {
                this.stokData.splice(index, 1);
            }
        }
    },
    
    mounted() {
        this.loadData();
    }
});