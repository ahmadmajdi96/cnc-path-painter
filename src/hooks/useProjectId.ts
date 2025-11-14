import { useEffect, useState } from 'react';

const PROJECT_ID_KEY = 'cortanex_project_id';

export const useProjectId = () => {
  const [projectId, setProjectIdState] = useState<string | null>(() => {
    return sessionStorage.getItem(PROJECT_ID_KEY);
  });

  const setProjectId = (id: string | null) => {
    if (id) {
      sessionStorage.setItem(PROJECT_ID_KEY, id);
    } else {
      sessionStorage.removeItem(PROJECT_ID_KEY);
    }
    setProjectIdState(id);
  };

  const clearProjectId = () => {
    sessionStorage.removeItem(PROJECT_ID_KEY);
    setProjectIdState(null);
  };

  return { projectId, setProjectId, clearProjectId };
};
