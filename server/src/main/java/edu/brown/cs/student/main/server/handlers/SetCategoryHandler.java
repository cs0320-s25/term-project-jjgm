package edu.brown.cs.student.main.server.handlers;

import edu.brown.cs.student.main.server.storage.StorageInterface;
import java.util.HashMap;
import java.util.Map;
import spark.Request;
import spark.Response;
import spark.Route;

public class SetCategoryHandler implements Route {

  public StorageInterface storageHandler;

  public SetCategoryHandler(StorageInterface storageHandler) {
    this.storageHandler = storageHandler;
  }

  @Override
  public Object handle(Request request, Response response) {
    Map<String, Object> responseMap = new HashMap<>();
    try {
      String uid = request.queryParams("uid");
      String category = request.queryParams("category");

      if (uid == null || category == null) {
        throw new IllegalArgumentException("UID and category must be provided");
      }

      Map<String, Object> profileData = new HashMap<>();

      try {
        Map<String, Object> existingProfile =
            this.storageHandler.getDocumentData(uid, "user_data", "profile");
        if (existingProfile != null) {
          profileData.putAll(existingProfile);
        }
      } catch (Exception e) {
        // -- PROFILE DOESNT EXIST
      }

      profileData.put("current_category", category);
      profileData.put("last_updated", System.currentTimeMillis());

      this.storageHandler.addDocument(uid, "user_data", "profile", profileData);

      Map<String, Object> categoryData = new HashMap<>();
      try {
        Map<String, Object> existingCategory =
            this.storageHandler.getDocumentData(uid, "categories", category);
        if (existingCategory != null) {
          categoryData.putAll(existingCategory);
        }
      } catch (Exception e) {
        // -- CATEGORY DOESNT EXIST
      }

      // -- NEW CATEGORY, INITIALIZE PNTS
      if (!categoryData.containsKey("total_points")) {
        categoryData.put("total_points", 0);
        categoryData.put("created_at", System.currentTimeMillis());
        this.storageHandler.addDocument(uid, "categories", category, categoryData);
      }

      responseMap.put("response_type", "success");
      responseMap.put("current_category", category);

    } catch (Exception e) {
      System.err.println("Error in SetCategoryHandler:");
      e.printStackTrace();
      responseMap.put("response_type", "failure");
      responseMap.put("error", e.getMessage());
    }

    return Utils.toMoshiJson(responseMap);
  }
}
