/**
 * API Service
 * Service untuk fetch data dari JSON file
 */

window.ApiService = {
    /**
     * Fetch data dari dataBahanAjar.json
     */
    fetchData: async function() {
        try {
            const response = await fetch('/data/dataBahanAjar.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            // Return empty data structure sebagai fallback
            return {
                upbjjList: [],
                kategoriList: [],
                pengirimanList: [],
                paket: [],
                stok: [],
                tracking: []
            };
        }
    }
};