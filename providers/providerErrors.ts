export function throwProviderError(provider: string, action: string, error: any): never {
  console.error(`[${provider}] Error during ${action}:`, error?.message || error);
  throw error;
}
