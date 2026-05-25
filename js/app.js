/**
 * Root Vue Application
 * Main entry point untuk aplikasi Vue.js SITTA
 */

new Vue({
    el: '#app',
    data: {
        currentTab: 'stok',
        modalVisible: false,
        modalTitle: '',
        modalContent: '',
        modalType: 'info',
        modalCallback: null
    },
    methods: {
        /**
         * Show delete confirmation modal
         */
        showDeleteConfirm(itemName, callback) {
            this.modalTitle = '⚠️ Konfirmasi Penghapusan';
            this.modalContent = `Apakah Anda yakin ingin menghapus "${itemName}"? Tindakan ini tidak dapat dibatalkan.`;
            this.modalType = 'danger';
            this.modalCallback = callback;
            this.modalVisible = true;
        },

        /**
         * Show info modal
         */
        showInfo(title, content) {
            this.modalTitle = title;
            this.modalContent = content;
            this.modalType = 'info';
            this.modalVisible = true;
        },

        /**
         * Close modal
         */
        closeModal() {
            this.modalVisible = false;
            this.modalCallback = null;
        },

        /**
         * Handle modal confirm
         */
        handleModalConfirm() {
            if (this.modalCallback) {
                this.modalCallback();
            }
            this.closeModal();
        }
    }
});
