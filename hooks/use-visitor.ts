import { useEffect } from "react";
import { usePersistedState } from "./aevr/use-persisted-state";

export interface Visitor {
  _id: string;
  name?: string;
}

interface VisitorState {
  id: string | null;
  name: string | null;
  data: Visitor | null;
}

export function useVisitor() {
  const { state, setState, isHydrated } = usePersistedState<VisitorState>(
    {
      id: null,
      name: null,
      data: null,
    },
    {
      storageKey: "md-viewer-visitor",
    }
  );

  useEffect(() => {
    const identifyVisitor = async () => {
      if (!isHydrated) return;

      // If we already have visitor data and it matches our stored ID, we might not need to re-identify
      // But to be safe and ensure lastActiveAt is updated, we call the API

      try {
        const response = await fetch("/api/visitor", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: state.id,
            name: state.name,
          }),
        });

        const result = await response.json();

        if (result.success) {
          setState((prev) => ({
            ...prev,
            id: result.data._id,
            name: result.data.name || prev.name,
            data: result.data,
          }));
        }
      } catch (error) {
        console.error("Failed to identify visitor:", error);
      }
    };

    identifyVisitor();
  }, [isHydrated, state.id, state.name, setState]); // Run once when hydrated

  const updateName = async (name: string) => {
    if (!state.data) return;

    try {
      const response = await fetch("/api/visitor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: state.data._id,
          name,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setState((prev) => ({
          ...prev,
          name: result.data.name,
          data: result.data,
        }));
      }
    } catch (error) {
      console.error("Failed to update visitor name:", error);
    }
  };

  return {
    visitor: state.data,
    isLoading: !isHydrated || !state.data,
    updateName,
  };
}
