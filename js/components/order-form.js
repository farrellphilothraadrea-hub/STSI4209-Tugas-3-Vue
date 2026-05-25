/**
 * Order Form Component
 * Component untuk form tambah/edit order (reusable)
 */

Vue.component('order-form', {
    props: {
        title: String,
        formData: Object,
        errors: Object
    },
    template: `#tpl-order-form`,
    methods: {
        handleSubmit() {
            this.$emit('submit');
        },
        handleCancel() {
            this.$emit('cancel');
        }
    }
});
