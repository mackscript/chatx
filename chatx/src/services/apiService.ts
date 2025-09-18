import axios from "axios";
import type { Message } from "./socketService";
import { API_BASE_URL } from "./config";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  count?: number;
}

export interface SendMessageRequest {
  message: string;
  user: string;
  room?: string;
}

export interface GetMessagesParams {
  limit?: number;
  skip?: number;
  room?: string;
  userId?: string;
}

class ApiService {
  async sendMessage(
    messageData: SendMessageRequest,
  ): Promise<ApiResponse<Message>> {
    const response = await apiClient.post("/messages", messageData);
    return response.data;
  }

  async getMessages(
    params: GetMessagesParams = {},
  ): Promise<ApiResponse<Message[]>> {
    console.log('🌐 Making API request to /messages with params:', params);
    console.log('🔗 API Base URL:', API_BASE_URL);
    
    try {
      const response = await apiClient.get("/messages", { params });
      console.log('📡 API Response status:', response.status);
      console.log('📊 API Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('🚨 API Request failed:', error);
      throw error;
    }
  }

  async getMessageById(id: string): Promise<ApiResponse<Message>> {
    const response = await apiClient.get(`/messages/${id}`);
    return response.data;
  }

  async deleteMessage(id: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete(`/messages/${id}`);
    return response.data;
  }

  async checkHealth(): Promise<any> {
    const response = await apiClient.get("/health");
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
