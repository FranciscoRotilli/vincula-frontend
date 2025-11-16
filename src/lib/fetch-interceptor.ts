let originalFetch: typeof fetch;

export function setupFetchInterceptor() {
  if (typeof window === 'undefined') return;

  if (!originalFetch) {
    originalFetch = window.fetch;
  }

  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);

    const url = typeof args[0] === 'string' ? args[0] : args[0] instanceof URL ? args[0].href : (args[0] as Request).url;
    
    if (response.status === 401 && url.includes('/api/')) {
      const authRequired = response.headers.get('X-Auth-Required');
      
      if (authRequired === 'true') {
        const currentPath = window.location.pathname + window.location.search;
        
        window.location.href = `/?next=${encodeURIComponent(currentPath)}`;
      }
    }

    return response;
  };
}

export function restoreFetch() {
  if (typeof window === 'undefined') return;
  if (originalFetch) {
    window.fetch = originalFetch;
  }
}
