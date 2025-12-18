import axios from "axios";
export const fetchData = async (endpoint) => {
  const response = await axios.get(endpoint);
  return response.data;
};



export const postData = async (
  endpoint: string,
  data: any,
  isFormData: boolean = false
) => {
  const headers = isFormData
    ? { "Content-Type": "multipart/form-data" }
    : { "Content-Type": "application/json" };

  const response = await axios.post(endpoint, data, { headers });
  return response.data;
};

export const updateData = async (endpoint, data) => {
  const response = await axios.patch(endpoint, data);
  return response.data;
};

export const patchData = async (endpoint, data) => {
  const response = await axios.patch(endpoint, data);
  return response.data;
};

export const deleteData = async (endpoint) => {
  const { data } = await axios.delete(endpoint);
  return data;
};

export const deleteDataWithBody = async (endpoint, body) => {
  const { data } = await axios.delete(endpoint, body);
  return data;
};
export const getData = async (endpoint) => {
  const { data } = await axios.get(endpoint);
  return data;
};