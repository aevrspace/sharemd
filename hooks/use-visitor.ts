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

      // If we already have a visitor ID and name, we might not need to re-identify immediately
      // But we want to update lastActiveAt.
      // To prevent multiple calls from different components, we can use a simple check or debounce.
      // For now, let's just ensure we don't call if we just called it.

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
          // Only update state if data actually changed to avoid triggering effects
          setState((prev) => {
            if (
              prev.id === result.data._id &&
              prev.name === result.data.name &&
              JSON.stringify(prev.data) === JSON.stringify(result.data)
            ) {
              return prev;
            }
            return {
              ...prev,
              id: result.data._id,
              name: result.data.name || prev.name,
              data: result.data,
            };
          });
        }
      } catch (error) {
        console.error("Failed to identify visitor:", error);
      }
    };

    identifyVisitor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, state.id]); // Removed state.name and setState to prevent loops, added deep comparison in setter

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
