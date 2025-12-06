/**
 * POST API SERVICE
 * Centralized service for post-related backend API calls.
 * Methods:
 * - getFeed(page, limit, sortBy, order): Get paginated feed posts
 * - getPostById(postId): Get single post by ID
 * - getPostsByUser(userId, page, limit): Get posts by specific user
 * - likePost(postId, userId, username): Like a post
 * - unlikePost(postId, userId): Unlike a post
 * - addComment(postId, content, userId, username): Add comment to post
 * - deleteComment(postId, commentId): Delete a comment
 * - deletePost(postId): Delete a post
 */

// 1. API Configuration
const API_BASE = "http://recifeed.example.com/api";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` })
  };
};

// 2. Post Service Object
export const postService = {

  // 3. Create Post with file uploads
  createPost: async ({ content, images = [], userId, username, recipe_id = '000000000000000000000000' || null }) => {
    const formData = new FormData();
    
    // Add form fields
    formData.append('content', content);
    formData.append('userId', userId);
    formData.append('username', username);
    formData.append('recipe_id', recipe_id);
    
    // Add image files (images can be File objects or base64 strings)
    if (Array.isArray(images) && images.length > 0) {
      images.forEach((image, index) => {
        if (image instanceof File) {
          // If it's a File object, append directly
          formData.append('images', image);
        }
        // If it's a base64 string, we skip it since multer expects actual files
        // The frontend will handle converting File objects to base64 on the backend
      });
    }
    
    const token = localStorage.getItem('token');
    const headers = {
      ...(token && { "Authorization": `Bearer ${token}` })
      // Don't set Content-Type - browser will set it with multipart boundary
    };
    
    const response = await fetch(`${API_BASE}/posts`, {
      method: "POST",
      headers: headers,
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create post");
    }
    
    return response.json();
  },

  // 4. Get Feed - retrieve paginated posts
  getFeed: async (page = 1, limit = 20, sortBy = 'created_at', order = 'desc') => {
    const response = await fetch(
      `${API_BASE}/posts/feed?page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}`,
      {
        method: "GET",
        headers: getAuthHeaders()
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch feed");
    }
    
    return response.json();
  },

  // 4. Get Post by ID
  getPostById: async (postId) => {
    const response = await fetch(`${API_BASE}/posts/${postId}`, {
      method: "GET",
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch post");
    }
    
    return response.json();
  },

  // 5. Get Posts by User
  getPostsByUser: async (userId, page = 1, limit = 20) => {
    const response = await fetch(
      `${API_BASE}/posts/user/${userId}?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: getAuthHeaders()
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch user posts");
    }
    
    return response.json();
  },

  // 6. Like a Post
  likePost: async (postId, userId, username) => {
    const response = await fetch(`${API_BASE}/posts/${postId}/likes`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, username })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to like post");
    }
    
    return response.json();
  },

  // 7. Unlike a Post
  unlikePost: async (postId, userId) => {
    const response = await fetch(`${API_BASE}/posts/${postId}/likes`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to unlike post");
    }
    
    return response.json();
  },

  // 8. Add Comment
  addComment: async (postId, content, userId, username) => {
    const response = await fetch(`${API_BASE}/posts/${postId}/comments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ content, userId, username })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to add comment");
    }
    
    return response.json();
  },

  // 9. Delete Comment
  deleteComment: async (postId, commentId) => {
    const response = await fetch(`${API_BASE}/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete comment");
    }
    
    return response.json();
  },

  // 10. Delete Post
  deletePost: async (postId) => {
    const response = await fetch(`${API_BASE}/posts/${postId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete post");
    }
    
    return response.json();
  },

  // 11. Update Post with file uploads
  updatePost: async (postId, { content, images }) => {
    const formData = new FormData();
    
    // Add form fields
    formData.append('content', content);
    
    // Add image files
    if (Array.isArray(images) && images.length > 0) {
      images.forEach((image) => {
        if (image instanceof File) {
          formData.append('images', image);
        }
      });
    }
    
    const token = localStorage.getItem('token');
    const headers = {
      ...(token && { "Authorization": `Bearer ${token}` })
    };
    
    const response = await fetch(`${API_BASE}/posts/${postId}`, {
      method: "PUT",
      headers: headers,
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update post");
    }
    
    return response.json();
  }
};
