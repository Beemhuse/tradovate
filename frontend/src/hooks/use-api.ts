"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
} from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import {
  deleteData,
  deleteDataWithBody,
  fetchData,
  patchData,
  postData,
  updateData,
} from "@/config/api";
import { toast } from "@/components/ui/use-toast";
import { handleGenericError } from "@/lib/errorHandler";
import initAxios from "@/config/config";

type Endpoint = string | ((id: string | number) => string);

initAxios();
/* -------------------------------------------
 * FETCH DATA (GET)
 * ------------------------------------------ */
export const useFetchData = <T = any>(endpoint: Endpoint, queryKey: string) => {
  return useQuery<T, AxiosError>({
    queryKey: [queryKey, endpoint],
    queryFn: async () => {
      try {
        const response = await fetchData(endpoint);
        return response;
      } catch (error) {
        const errorMessage = handleGenericError(error as AxiosError);
        throw new Error(errorMessage);
      }
    },
    refetchOnWindowFocus: false,
  });
};

/* -------------------------------------------
 * CREATE DATA (POST)
 * ------------------------------------------ */
export const useCreateData = <T = any, D = any>(
  endpoint: string,
  queryKey: QueryKey,
  isFormData: boolean = false
) => {
  const queryClient = useQueryClient();

  return useMutation<T, AxiosError, D>({
    mutationFn: async (data: D) => {
      const response = await postData(endpoint, data, isFormData);
      return response; // ✅ return clean data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey });
      console.log("✅ useCreateData success:", data);
    },
    onError: (error) => {
      const message = handleGenericError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw new Error(message);
    },
  });
};

/* -------------------------------------------
 * UPDATE DATA (PUT / PATCH)
 * ------------------------------------------ */
export const useUpdateData = <T = any, D = any>(
  endpoint: Endpoint,
  queryKey: QueryKey
) => {
  const queryClient = useQueryClient();
  return useMutation<T, AxiosError, D>({
    mutationFn: async (newData: D) => {
      const finalEndpoint =
        typeof endpoint === "function" ? (endpoint as any)(newData) : endpoint;
      const response = await updateData(finalEndpoint, newData);
      return response.data || response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Updated",
        description: "Data updated successfully.",
      });
      // return response;
    },
    onError: (error) => {
      const message = handleGenericError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw new Error(message);
    },
  });
};

/* -------------------------------------------
 * PATCH DATA
 * ------------------------------------------ */
export const usePatchData = <T = any, D = any>(
  endpoint: Endpoint,
  queryKey: QueryKey
) => {
  const queryClient = useQueryClient();

  return useMutation<T, AxiosError, D>({
    mutationFn: async (newData: D) => {
      const finalEndpoint =
        typeof endpoint === "function" ? (endpoint as any)(newData) : endpoint;
      const response = await patchData(finalEndpoint, newData);
      return response.data || response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Patched",
        description: "Changes saved successfully.",
      });
      return response;
    },
    onError: (error) => {
      const message = handleGenericError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw new Error(message);
    },
  });
};

/* -------------------------------------------
 * DELETE DATA
 * ------------------------------------------ */
export const useDeleteData = <T = any>(
  endpoint: Endpoint,
  queryKey: QueryKey
) => {
  const queryClient = useQueryClient();

  return useMutation<T, AxiosError, string | number>({
    mutationFn: async (id: string | number) => {
      const url = typeof endpoint === "function" ? endpoint(id) : endpoint;
      const response = await deleteData(url);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Deleted",
        description: "Item removed successfully.",
      });
    },
    onError: (error) => {
      const message = handleGenericError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw new Error(message);
    },
  });
};

/* -------------------------------------------
 * DELETE DATA WITH BODY
 * ------------------------------------------ */
type DeleteWithBodyParams<D = any> = {
  id: string | number;
  body: D;
};

export const useDeleteDataWithBody = <T = any, D = any>(
  endpoint: Endpoint,
  queryKey: QueryKey
) => {
  const queryClient = useQueryClient();

  return useMutation<T, AxiosError, DeleteWithBodyParams<D>>({
    mutationFn: async ({ id, body }: DeleteWithBodyParams<D>) => {
      const url = typeof endpoint === "function" ? endpoint(id) : endpoint;
      const response = await deleteDataWithBody(url, body);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Deleted",
        description: "Item removed successfully.",
      });
    },
    onError: (error) => {
      const message = handleGenericError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw new Error(message);
    },
  });
};
