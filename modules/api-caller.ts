export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export async function callApi(
    cmd: string,
    method: string = 'GET',
    body: any = null,
    onErrorCb?: (error: string | Error) => void): Promise<ApiResponse> {

    onErrorCb ||= (e: string | Error) => console.log(e);

    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    let url = `api.php?cmd=${cmd}`;

    try {
        // For GET requests, don't send the options to avoid CORS preflight
        const response = await fetch(url, method === 'GET' ? undefined : options);

        if (response.ok) {
            return { success: true, data: await response.json() };
        }

        onErrorCb(`API call failed: ${response.status} ${response.statusText}`);

        return {
            success: false,
            error: `API call failed with status ${response.status}`
        };

    } catch (error: any) {
        onErrorCb(`Failed API call to ${cmd}: ${error}`);

        return { success: false, error: error.message };
    }
}
