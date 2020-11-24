const FETCH_TIMEOUT = 10000;

// @ts-ignore
export async function Fetch(
  input: RequestInfo,
  init?: RequestInit,
  _retryCount: number = 0
): Promise<any> {
  return new Promise((resolve, reject) => {
    const onResponse = async (response: Response) => {
      console.info("OnResponse success");
      if (!response.ok) {
        console.info("status", response.status, " ok ", response.ok);
        reject(new Error(response.statusText));
      }
      try {
        const value = await response.json();
        return resolve(value);
      } catch (reason) {
        return reject(reason);
      }
    };

    const onError = (error: any) => {
      reject(error);
    };

    const rescueError = (error: any) => {
      console.warn(error);
      throw error;
    };

    async function fetchRequest() {
      try {
        try {
          const response = await fetch(input, init);
          return onResponse(response);
        } catch (error) {
          return onError(error);
        }
      } catch (error_1) {
        return rescueError(error_1);
      }
    }

    fetchRequest();

    if (FETCH_TIMEOUT) {
      const err = new Error("request timeout");
      setTimeout(reject, FETCH_TIMEOUT, err);
    }
  });
}

export async function AgoraFetch(
  input: RequestInfo,
  init?: RequestInit,
  retryCount: number = 0
) {
  try {
    return await Fetch(input, init, retryCount);
  } catch (err) {
    if (err && err.message === "request timeout") {
      return { code: err.code, msg: null, response: null };
    }
    throw err;
  }
}
