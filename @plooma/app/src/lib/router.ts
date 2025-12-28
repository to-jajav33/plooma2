import { useState, useEffect } from "react";

/**
 * Simple client-side router hook
 */
export function useRouter() {
  const [path, setPath] = useState(() => {
    return window.location.pathname;
  });

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (newPath: string) => {
    window.history.pushState({}, "", newPath);
    setPath(newPath);
  };

  return { path, navigate };
}
