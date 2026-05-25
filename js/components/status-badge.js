/**
 * Status Badge Component
 * Menampilkan status stok dengan badge berwarna dan tooltip catatan
 */

Vue.component('status-badge', {
    props: {
        qty: Number,
        safety: Number,
        catatan: String
    },
    template: `#tpl-status-badge`,
    computed: {
        statusText() {
            if (this.qty === 0) {
                return '🔴 Kosong';
            } else if (this.qty < this.safety) {
                return '🟠 Menipis';
            } else {
                return '🟢 Aman';
            }
        },
        badgeClass() {
            if (this.qty === 0) {
                return 'badge-danger';
            } else if (this.qty < this.safety) {
                return 'badge-warning';
            } else {
                return 'badge-success';
            }
        },
        catatanHTML() {
            return this.catatan || '';
        }
    }
});