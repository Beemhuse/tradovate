"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
} from "@tanstack/react-query";
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

type Endpoint = string | ((id: string | number) => string);
/* -------------------------------------------
 * FETCH DATA (GET)
 * ------------------------------------------ */
export const useFetchData = <T = any>(endpoint: Endpoint, queryKey: string) => {
  return useQuery<T, Error>({
    queryKey: [queryKey, endpoint],
    queryFn: async () => {
      try {
        const finalEndpoint =
          typeof endpoint === "function" ? (endpoint as any)() : endpoint;
        const response = await fetchData(finalEndpoint);
        return response;
      } catch (error) {
        const errorMessage = handleGenericError(error as Error);
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
  endpoint: string | ((data: D) => string),
  queryKey: QueryKey,
  isFormData: boolean = false
) => {
  const queryClient = useQueryClient();

  return useMutation<T, Error, D>({
    mutationFn: async (data: D) => {
      const finalEndpoint =
        typeof endpoint === "function" ? endpoint(data) : endpoint;
      const response = await postData(finalEndpoint, data, isFormData);
      return response; // ✅ return clean data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey });
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
  return useMutation<T, Error, D>({
    mutationFn: async (newData: D) => {
      const finalEndpoint =
        typeof endpoint === "function" ? (endpoint as any)(newData) : endpoint;
      const response = await updateData(finalEndpoint, newData);
      return response;
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
  endpoint: Endpoint | ((data: D) => string),
  queryKey: QueryKey
) => {
  const queryClient = useQueryClient();

  return useMutation<T, Error, D>({
    mutationFn: async (newData: D) => {
      // Support dynamic endpoint callback
      const finalEndpoint =
        typeof endpoint === "function" ? (endpoint as any)(newData) : endpoint;

      const response = await patchData(finalEndpoint as string, newData);
      return response;
    },

    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey });

      toast({
        title: response?.frontendMessage || "Success",
        description: "Changes saved successfully.",
      });

      return response;
    },

    onError: (error: any) => {
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

  return useMutation<T, Error, string | number>({
    mutationFn: async (id: string | number) => {
      const url = typeof endpoint === "function" ? endpoint(id) : endpoint;
      const response = await deleteData(url);
      return response;
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

  return useMutation<T, Error, DeleteWithBodyParams<D>>({
    mutationFn: async ({ id, body }: DeleteWithBodyParams<D>) => {
      const url = typeof endpoint === "function" ? endpoint(id) : endpoint;
      const response = await deleteDataWithBody(url, body);
      return response;
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
