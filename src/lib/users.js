// User CRUD and helpers for Supabase
import { supabase } from './supabase';

/**
 * Fetch all users from the backend.
 * @returns {Promise<{data: Array, error: any}>}
 */
export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    return { data: data.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      lastLogin: user.last_login,
      contact: user.contact,
      appAccess: user.app_access || [],
      credentials: user.credentials
    })), error: null };
  } catch (error) {
    // console.error removed
    return { data: [], error };
  }
};

/**
 * Fetch a single user by ID.
 * @param {string|number} id - User ID
 * @returns {Promise<{data: Object|null, error: any}>}
 */
export const getUserById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return { data: {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
      lastLogin: data.last_login,
      contact: data.contact,
      appAccess: data.app_access || [],
      credentials: data.credentials
    }, error: null };
  } catch (error) {
    // console.error removed
    return { data: null, error };
  }
};

/**
 * Add a new user.
 * @param {Object} userData - User data
 * @returns {Promise<{data: Object|null, error: any}>}
 */
export const addUser = async (userData) => {
  try {
    const dbData = {
      name: userData.name,
      email: userData.email,
      role: userData.role,
      status: userData.status,
      last_login: userData.lastLogin,
      contact: userData.contact,
      app_access: userData.appAccess || [],
      credentials: userData.credentials
    };
    const { data, error } = await supabase
      .from('users')
      .insert([dbData])
      .select()
      .single();
    if (error) throw error;
    return { data: {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
      lastLogin: data.last_login,
      contact: data.contact,
      appAccess: data.app_access || [],
      credentials: data.credentials
    }, error: null };
  } catch (error) {
    // console.error removed
    return { data: null, error };
  }
};

/**
 * Update an existing user.
 * @param {string|number} userId - User ID
 * @param {Object} updatedData - Updated user data
 * @returns {Promise<{data: Object|null, error: any}>}
 */
export const updateUser = async (userId, updatedData) => {
  try {
    const dbData = {
      name: updatedData.name,
      email: updatedData.email,
      role: updatedData.role,
      status: updatedData.status,
      last_login: updatedData.lastLogin,
      contact: updatedData.contact,
      app_access: updatedData.appAccess || [],
      credentials: updatedData.credentials,
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase
      .from('users')
      .update(dbData)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return { data: {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
      lastLogin: data.last_login,
      contact: data.contact,
      appAccess: data.app_access || [],
      credentials: data.credentials
    }, error: null };
  } catch (error) {
    // console.error removed
    return { data: null, error };
  }
};

/**
 * Delete a user by ID.
 * @param {string|number} userId - User ID
 * @returns {Promise<{data: boolean, error: any}>}
 */
export const deleteUser = async (userId) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    if (error) throw error;
    return { data: true, error: null };
  } catch (error) {
    // console.error removed
    return { data: false, error };
  }
}; 