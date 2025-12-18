import { API_URL, getAuthHeaders, handleFetchResponse } from "./config";

export const fetchData = async (endpoint: string) => {
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleFetchResponse(response);
};

export const getData = async (endpoint: string) => {
  return fetchData(endpoint);
};

export const postData = async (
  endpoint: string,
  data: any,
  isFormData: boolean = false
) => {
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;

  const headers = getAuthHeaders();
  let body: any;

  if (isFormData) {
    // For FormData, remove Content-Type header to let browser set it with boundary
    delete headers["Content-Type"];
    body = data;
  } else {
    body = JSON.stringify(data);
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body,
  });

  return handleFetchResponse(response);
};

export const updateData = async (endpoint: string, data: any) => {
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleFetchResponse(response);
};
export const patchData = async (endpoint: string, data: any) => {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleFetchResponse(response);
};


export const deleteData = async (endpoint: string) => {
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleFetchResponse(response);
};

export const deleteDataWithBody = async (endpoint: string, body: any) => {
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  return handleFetchResponse(response);
};
