import { apiUrl } from "../apiConfig";

// One helper for every admin call. The workspace reuses the exact URLs, verbs
// and cookie credentials the previous single-page dashboard used, so no
// authentication, permission, or backend behaviour changes.
export async function adminRequest<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const response = await fetch(`${apiUrl}${path}`, {
        credentials: "include",
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result?.success === false) {
        throw new Error(result?.message || "Request failed. Try again.");
    }
    return result as T;
}

export function adminJson<T>(
    path: string,
    method: "POST" | "PATCH" | "DELETE",
    body?: unknown,
) {
    return adminRequest<T>(path, {
        method,
        body: JSON.stringify(body ?? {}),
    });
}