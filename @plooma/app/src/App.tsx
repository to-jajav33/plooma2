import "./index.css";
import { StoryEditor } from "./components/StoryEditor";
import { AuthPage } from "./components/AuthPage";
import { useRouter } from "./lib/router";
import { AuthStore } from "./stores/AuthStore";
import { useEffect, useState } from "react";
import { useStore } from "@plooma/store";

export function App() {
  const { path, navigate } = useRouter();
  const authStore = AuthStore.proxy<typeof AuthStore>();
  const authState = useStore(authStore);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initial route check - only run once
    if (!isReady) {
      if (authState.hasMode() && path === "/") {
        navigate("/editor");
      } else if (!authState.hasMode() && path === "/editor") {
        navigate("/");
      }
      setIsReady(true);
    }
  }, [authState, path, navigate, isReady]);

  const handleAuthSuccess = () => {
    navigate("/editor");
  };

  if (!isReady) {
    return null; // Or a loading spinner
  }

  // Show auth page on root, editor on /editor
  if (path === "/editor") {
    // Only show editor if user is authenticated or in guest mode
    if (!authState.hasMode()) {
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
