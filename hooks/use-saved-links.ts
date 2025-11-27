import { usePersistedState } from "@/hooks/aevr/use-persisted-state";

export interface SavedLink {
  id: string;
  createdAt: number;
  title?: string;
}

export interface LinkGroup {
  id: string;
  title: string;
  createdAt: number;
  linkIds: string[];
}

interface SavedLinksState {
  links: SavedLink[];
  groups: LinkGroup[];
}

export const useSavedLinks = () => {
  const { state, setState, isHydrated } = usePersistedState<SavedLinksState>({
    storageKey: "md-viewer-saved-links",
    enablePersistence: true,
  });

  // Initialize links and groups if undefined (first run)
  const links = state?.links || [];
  const groups = state?.groups || [];

  const saveLink = (id: string, title?: string) => {
    if (links.some((link) => link.id === id)) return;

    const newLink: SavedLink = {
      id,
      createdAt: Date.now(),
      title: title || `Markdown ${id.substring(0, 6)}`,
    };

    setState((prev) => ({
      links: [newLink, ...(prev?.links || [])],
      groups: prev?.groups || [],
    }));
  };

  const removeLink = (id: string) => {
    setState((prev) => ({
      links: (prev?.links || []).filter((link) => link.id !== id),
      // Also remove from any groups
      groups: (prev?.groups || []).map((group) => ({
        ...group,
        linkIds: group.linkIds.filter((linkId) => linkId !== id),
      })),
    }));
  };

  const isSaved = (id: string) => {
    return links.some((link) => link.id === id);
  };

  // Grouping functions
  const createGroup = (title: string, linkIds: string[]) => {
    const newGroup: LinkGroup = {
      id: `group-${Date.now()}`,
      title,
      createdAt: Date.now(),
      linkIds,
    };

    setState((prev) => ({
      links: prev?.links || [],
      groups: [newGroup, ...(prev?.groups || [])],
    }));
  };

  const deleteGroup = (groupId: string) => {
    setState((prev) => ({
      links: prev?.links || [],
      groups: (prev?.groups || []).filter((group) => group.id !== groupId),
    }));
  };

  const addToGroup = (groupId: string, linkIds: string[]) => {
    setState((prev) => ({
      links: prev?.links || [],
      groups: (prev?.groups || []).map((group) => {
        if (group.id === groupId) {
          // Add only unique new IDs
          const newIds = linkIds.filter((id) => !group.linkIds.includes(id));
          return { ...group, linkIds: [...group.linkIds, ...newIds] };
        }
        return group;
      }),
    }));
  };

  const removeFromGroup = (groupId: string, linkId: string) => {
    setState((prev) => ({
      links: prev?.links || [],
      groups: (prev?.groups || []).map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            linkIds: group.linkIds.filter((id) => id !== linkId),
          };
        }
        return group;
      }),
    }));
  };

  return {
    links,
    groups,
    saveLink,
    removeLink,
    isSaved,
    createGroup,
    deleteGroup,
    addToGroup,
    removeFromGroup,
    isHydrated,
  };
};
