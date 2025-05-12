/**
 * -- ADD POINTS TO USER CATEGORY
 * @param userId user's ID
 * @param category song category
 * @param points # of points to add
 * @returns promise with the API response
 */
export const addPoints = async (
    userId: string,
    category: string,
    points: number
  ): Promise<any> => {
    try {
      const response = await fetch(
        `http://localhost:3232/add-points?uid=${userId}&category=${encodeURIComponent(
          category
        )}&points=${points}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to add points: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error adding points:", error);
      throw error;
    }
  };
  
  export const getUserStats = async (userId: string): Promise<any> => {
    try {
      const response = await fetch(
        `http://localhost:3232/get-user-stats?uid=${userId}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to get user stats: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error getting user stats:", error);
      throw error;
    }
  };
  

  export const setCategory = async (
    userId: string,
    category: string
  ): Promise<any> => {
    try {
      const response = await fetch(
        `http://localhost:3232/set-category?uid=${userId}&category=${encodeURIComponent(
          category
        )}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to set category: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error setting category:", error);
      throw error;
    }
  };