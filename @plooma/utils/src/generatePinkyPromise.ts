export type PinkyPromise = Promise<unknown> & {
  forceResolve: (value: unknown) => void;
  forceReject: (reason: unknown) => void;
  forceCancel: (reason: unknown) => void;
  state: "pending" | "fulfilled" | "rejected" | "cancelled";
};

export const generatePinkyPromise = (
  cb: (
    resolve: (value: unknown) => void,
    reject: (reason: unknown) => void
  ) => void
) => {
  let _forceResolve: (value: unknown) => void;
  let _forceReject: (reason: unknown) => void;
  let _forceCancel: (reason: unknown) => void;

  const promise = new Promise((resolve, reject) => {
    _forceResolve = (value: unknown) => {
      if (promise.state !== "pending") return;
      promise.state = "fulfilled";
      resolve(value);
    };
    _forceReject = (reason: unknown) => {
      if (promise.state !== "pending") return;
      promise.state = "rejected";
      reject(reason);
    };
    _forceCancel = (reason: unknown) => {
      if (promise.state !== "pending") return;
      promise.state = "cancelled";
      reject(reason);
    };
  }) as PinkyPromise;

  // Initialize PinkyPromise properties after they are assigned in the executor
  promise.forceResolve = (...args) => _forceResolve(...args);
  promise.forceReject = (...args) => _forceReject(...args);
  promise.forceCancel = (...args) => _forceCancel(...args);
  promise.state = "pending";

  return promise;
};
