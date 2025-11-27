import { usePersistedState } from "@/hooks/aevr/use-persisted-state";

export interface SavedLink {
  id: string;
  createdAt: number;
  title?: string;
}

interface SavedLinksState {
  links: SavedLink[];
}

export const useSavedLinks = () => {
  const { state, setState, isHydrated } = usePersistedState<SavedLinksState>({
    storageKey: "md-viewer-saved-links",
    enablePersistence: true,
  });

  // Initialize links if undefined (first run)
  const links = state?.links || [];

  const saveLink = (id: string, title?: string) => {
    if (links.some((link) => link.id === id)) return;

    const newLink: SavedLink = {
      id,
      createdAt: Date.now(),
      title: title || `Markdown ${id.substring(0, 6)}`,
    };

    setState((prev) => ({
      links: [newLink, ...(prev?.links || [])],
    }));
  };

  const removeLink = (id: string) => {
    setState((prev) => ({
      links: (prev?.links || []).filter((link) => link.id !== id),
    }));
  };

  const isSaved = (id: string) => {
    return links.some((link) => link.id === id);
  };

  return {
    links,
    saveLink,
    removeLink,
    isSaved,
    isHydrated,
  };
};
