/**
 * Modal Component
 * Component untuk menampilkan modal dialog (konfirmasi, alert, dll)
 */

Vue.component('app-modal', {
    props: {
        title: String,
        content: String,
        type: {
            type: String,
            default: 'info' // 'info', 'warning', 'danger', 'success'
        }
    },
    template: `#tpl-app-modal`,
    methods: {
        close() {
            this.$emit('close');
        },
        confirm() {
            this.$emit('confirm');
        }
    }
});
