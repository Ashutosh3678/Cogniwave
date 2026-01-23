import axios from 'axios';
import type { SupplierUploadResponse, UploadSupplierParams } from '../types';

// Configure your base URL here
const API_BASE_URL = 'https://anandvelpuri-zenith.hf.space'; // Derived from Links [cite: 41]

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const SupplierService = {
  /**
   * Endpoint: GET /templates/supplier-upload
   * Description: Download Supplier Upload Template
   * Source: PDF Page 1 [cite: 10]
   */
  downloadTemplate: async (): Promise<void> => {
    try {
      // We explicitly request a blob to handle file downloads correctly
      const response = await apiClient.get('/templates/supplier-upload', {
        responseType: 'blob', 
      });

      // Create a link element to trigger the download in the browser
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'supplier_template.csv'); // Assuming CSV, adjust based on actual file type
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading template:', error);
      throw error;
    }
  },

  /**
   * Endpoint: POST /supplier/upload
   * Description: Upload supplier file with store_slug and supplier_id
   * Source: PDF Page 1 [cite: 24, 28, 31, 38]
   */
  uploadFile: async ({
    storeSlug,
    supplierId,
    file,
  }: UploadSupplierParams): Promise<SupplierUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file); // [cite: 38]

    // Construct query parameters
    const params = new URLSearchParams();
    params.append('store_slug', storeSlug); // [cite: 28]
    if (supplierId) {
      params.append('supplier_id', supplierId); // [cite: 31]
    }

    const response = await apiClient.post<SupplierUploadResponse>(
      `/supplier/upload`,
      formData,
      {
        params: params, // Axios handles attaching these to the URL
        headers: {
          'Content-Type': 'multipart/form-data', // [cite: 42]
        },
      }
    );
    return response.data;
  },

  /**
   * Endpoint: GET /supplier/upload/{upload_id}/status
   * Description: Check the status of an upload
   * Source: PDF Page 2 [cite: 80, 85]
   */
  getUploadStatus: async (uploadId: string): Promise<any> => {
    const response = await apiClient.get<any>(
      `/supplier/upload/${uploadId}/status`
    );
    return response.data; // Returns JSON object now
  },
};

