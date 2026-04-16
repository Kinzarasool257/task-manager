import axios from "axios";

/**
 * Centralized Axios instance for backend communication.
 */
const getBaseURL = () => {
  const rawUrl = import.meta.env.VITE_API_URL;
  if (!rawUrl) {
    return import.meta.env.MODE === 'development' ? "http://localhost:4000/api" : "/api";
  }
  // Ensure it ends with /api
  return rawUrl.endsWith("/api") ? rawUrl : `${rawUrl}/api`;
};

const baseURL = getBaseURL();
console.log("Current API URL:", baseURL);

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Syncs the Kinde user profile with our database.
 * @param {Object} userData - The user object from Kinde.
 * @returns {Promise<Object>} The synced user from the database.
 */
export const syncUserWithDb = async (userData, preferences = null) => {
  try {
    const response = await api.post("/users/sync", {
      externalId: userData.id,
      email: userData.email,
      name: `${userData.given_name || ""} ${userData.family_name || ""}`.trim(),
      image: userData.picture,
      preferences
    });
    return response.data;
  } catch (error) {
    console.error("Failed to sync user with database:", error);
    throw error;
  }
};

/**
 * Fetches a single user by their internal database ID.
 */
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw error;
  }
};

/**
 * Fetches all workspaces for a given user.
 * @param {string} userId - The internal database ID of the user.
 */
export const getUserWorkspaces = async (userId) => {
  try {
    const response = await api.get(`/workspaces/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch workspaces:", error);
    throw error;
  }
};

/**
 * Creates a new workspace and sets the user as ADMIN.
 * @param {string} name - The name of the workspace.
 * @param {string} ownerId - The internal database ID of the owner.
 */
export const createWorkspace = async (name, ownerId) => {
  try {
    console.log("Creating Workspace Payload:", { name, ownerId });
    const response = await api.post("/workspaces", { name, ownerId });
    return response.data;
  } catch (error) {
    console.error("Failed to create workspace:", error);
    throw error;
  }
};

/**
 * Fetches all projects for a specific workspace.
 */
export const getWorkspaceProjects = async (workspaceId) => {
  try {
    const response = await api.get(`/projects/${workspaceId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    throw error;
  }
};

/**
 * Creates a new project.
 */
export const createProject = async ({ name, description, workspaceId }) => {
  try {
    const response = await api.post("/projects", { name, description, workspaceId });
    return response.data;
  } catch (error) {
    console.error("Failed to create project:", error);
    throw error;
  }
};

/**
 * Creates a new task in the database.
 */
export const createTask = async (taskData) => {
  try {
    const response = await api.post("/tasks", taskData);
    return response.data;
  } catch (error) {
    console.error("Failed to create task:", error);
    throw error;
  }
};

/**
 * Updates a task's status or details.
 */
export const updateTask = async (taskId, data) => {
  try {
    const response = await api.patch(`/tasks/${taskId}`, data);
    return response.data;
  } catch (error) {
    console.error("Failed to update task:", error);
    throw error;
  }
};

/**
 * Fetches a single project by its ID.
 */
export const getProjectById = async (projectId) => {
  try {
    const response = await api.get(`/projects/by-id/${projectId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch project:", error);
    throw error;
  }
};

/**
 * Updates a workspace's details.
 */
export const updateWorkspace = async (workspaceId, data) => {
  try {
    const response = await api.patch(`/workspaces/${workspaceId}`, data);
    return response.data;
  } catch (error) {
    console.error("Failed to update workspace:", error);
    throw error;
  }
};

/**
 * Deletes a workspace.
 */
export const deleteWorkspace = async (workspaceId) => {
  try {
    const response = await api.delete(`/workspaces/${workspaceId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete workspace:", error);
    throw error;
  }
};

/**
 * Fetches all members of a workspace.
 */
export const getWorkspaceMembers = async (workspaceId) => {
  try {
    const response = await api.get(`/workspaces/${workspaceId}/members`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch members:", error);
    throw error;
  }
};

/**
 * Invites a member to a workspace by email.
 */
export const inviteMemberToWorkspace = async (workspaceId, email) => {
  try {
    const response = await api.post(`/workspaces/${workspaceId}/members`, { email });
    return response.data;
  } catch (error) {
    console.error("Failed to invite member:", error);
    throw error;
  }
};

/**
 * Removes a member from a workspace.
 */
export const removeMemberFromWorkspace = async (memberId) => {
  try {
    const response = await api.delete(`/members/${memberId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to remove member:", error);
    throw error;
  }
};

/**
 * Updates a project's details.
 */
export const updateProject = async (projectId, data) => {
  try {
    const response = await api.patch(`/projects/${projectId}`, data);
    return response.data;
  } catch (error) {
    console.error("Failed to update project:", error);
    throw error;
  }
};

/**
 * Deletes a project.
 */
export const deleteProject = async (projectId) => {
  try {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete project:", error);
    throw error;
  }
};

/**
 * Updates user preferences.
 */
export const updateUserPreferences = async (userId, preferences) => {
  try {
    const response = await api.patch(`/users/${userId}/preferences`, { preferences });
    return response.data;
  } catch (error) {
    console.error("Failed to update preferences:", error);
    throw error;
  }
};

/**
 * Fetches public workspace info for the join page.
 */
export const getInviteInfo = async (inviteCode) => {
  try {
    const response = await api.get(`/workspace-invite/${inviteCode}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch invite info:", error);
    throw error;
  }
};

/**
 * Joins a workspace using an invite code.
 */
export const joinWorkspaceByInvite = async (inviteCode, userId) => {
  try {
    const response = await api.post(`/workspace-invite/${inviteCode}/join`, { userId });
    return response.data;
  } catch (error) {
    console.error("Failed to join workspace:", error);
    throw error;
  }
};

/**
 * Resets a workspace's invite code.
 */
export const resetWorkspaceInviteCode = async (workspaceId) => {
  try {
    const response = await api.patch(`/workspaces/${workspaceId}/reset-invite`);
    return response.data;
  } catch (error) {
    console.error("Failed to reset invite code:", error);
    throw error;
  }
};

/**
 * Assigns a member to a specific project.
 */
export const assignMemberToProject = async (projectId, memberId) => {
  try {
    const response = await api.post(`/projects/${projectId}/members`, { memberId });
    return response.data;
  } catch (error) {
    console.error("Failed to assign member to project:", error);
    throw error;
  }
};

/**
 * Unassigns a member from a specific project.
 */
export const unassignMemberFromProject = async (projectId, memberId) => {
  try {
    const response = await api.delete(`/projects/${projectId}/members/${memberId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to unassign member from project:", error);
    throw error;
  }
};

export default api;
