import type { NitroFetchOptions, TypedInternalResponse, ExtractedRouteMethod, NitroFetchRequest } from "nitropack";
export async function fetchWithTimeout<
  T = unknown, 
  R extends NitroFetchRequest = NitroFetchRequest, 
  O extends NitroFetchOptions<R> = NitroFetchOptions<R>
>(
  url: R,
  fetchOptions?: O
) {
  const controller = new AbortController();
  const id = setTimeout(() => {
    controller.abort();
    throw new Error("Request timed out");
  }, 15_000);
  const res = await $fetch<T>(url, {
    ...fetchOptions,
    signal: controller.signal,
  });
  clearTimeout(id);
  return res as Promise<TypedInternalResponse<R, T, NitroFetchOptions<R> extends O ? "get" : ExtractedRouteMethod<R, O>>>;
}
