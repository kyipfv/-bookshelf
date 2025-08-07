import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

export const bookService = {
  async getBooks(visitorId) {
    const { data } = await api.get('/books', { params: { visitorId } });
    return data;
  },

  async addBook(bookData) {
    const { data } = await api.post('/books', bookData);
    return data;
  },

  async uploadImages(visitorId, files) {
    const formData = new FormData();
    formData.append('visitorId', visitorId);
    files.forEach(file => {
      formData.append('files', file);
    });

    const { data } = await api.post('/books/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  async updateBook(id, bookData) {
    const { data } = await api.put(`/books/${id}`, bookData);
    return data;
  },

  async deleteBook(id, visitorId) {
    const { data } = await api.delete(`/books/${id}`, { params: { visitorId } });
    return data;
  }
};

export default api;