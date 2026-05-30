import axios from 'axios';

export default axios.create({
  baseURL: 'https://cloudlms-backend.onrender.com/api'
});