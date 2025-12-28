import "./index.css";
import { StoryEditor } from "./components/StoryEditor";
import { AuthPage } from "./components/AuthPage";
import { useRouter } from "./lib/router";
import { AuthStore } from "./stores/AuthStore";
import { useEffect, useState } from "react";

export function App() {
  const { path, navigate } = useRouter();
  const [authStore] = useState(() => new AuthStore());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initial route check - only run once
    if (!isReady) {
      if (authStore.hasMode() && path === "/") {
        navigate("/editor");
      } else if (!authStore.hasMode() && path === "/editor") {
        navigate("/");
      }
      setIsReady(true);
    }
  }, [authStore, path, navigate, isReady]);

  const handleAuthSuccess = () => {
    navigate("/editor");
  };

  if (!isReady) {
    return null; // Or a loading spinner
  }

  // Show auth page on root, editor on /editor
  if (path === "/editor") {
    // Only show editor if user is authenticated or in guest mode
    if (!authStore.hasMode()) {
      debugger;
      return null; // Will redirect in useEffect
    }
    return (
      <div className="container mx-auto p-8">
        <StoryEditor />
      </div>
    );
  }

  // Show auth page on root
  return <AuthPage onAuthSuccess={handleAuthSuccess} />;
}

export default App;
