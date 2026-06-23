import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const handleError = (error) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.errors?.[0] ||
    "Något gick fel";
  throw new Error(message);
};

// Auth
export const register = async (email, password) => {
  try {
    const { data } = await api.post("/auth/register", { email, password });
    localStorage.setItem("token", data.token);
    return data;
  } catch (error) {
    handleError(error);
  }
};

export const login = async (email, password) => {
  try {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    return data;
  } catch (error) {
    handleError(error);
  }
};

// Bilar
export const getAllCars = async () => {
  try {
    const { data } = await api.get("/cars");
    return data;
  } catch (error) {
    handleError(error);
  }
};

export const getCarById = async (id) => {
  try {
    const { data } = await api.get(`/cars/${id}`);
    return data;
  } catch (error) {
    handleError(error);
  }
};

export const createCar = async (carData) => {
  try {
    const { data } = await api.post("/cars", carData);
    return data;
  } catch (error) {
    handleError(error);
  }
};

export const updateCar = async (id, carData) => {
  try {
    const { data } = await api.put(`/cars/${id}`, carData);
    return data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteCar = async (id) => {
  try {
    const { data } = await api.delete(`/cars/${id}`);
    return data;
  } catch (error) {
    handleError(error);
  }
};

// Meddelanden
export const createMessage = async (data) => {
  try {
    const { data: res } = await api.post("/messages", data);
    return res;
  } catch (error) {
    handleError(error);
  }
};

export const getAllMessages = async () => {
  try {
    const { data } = await api.get("/messages");
    return data;
  } catch (error) {
    handleError(error);
  }
};

export const replyToMessage = async (id, reply) => {
  try {
    const { data } = await api.put(`/messages/${id}`, { reply });
    return data;
  } catch (error) {
    handleError(error);
  }
};

// Bilder
export const uploadImage = async (carId, file) => {
  try {
    const formData = new FormData();
    formData.append("image", file);
    const { data } = await api.post(`/images/${carId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteImage = async (carId, index) => {
  try {
    const { data } = await api.delete(`/images/${carId}/${index}`);
    return data;
  } catch (error) {
    handleError(error);
  }
};
