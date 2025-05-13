package edu.brown.cs.student.main.server.handlers;

import edu.brown.cs.student.main.server.storage.StorageInterface;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import spark.Request;
import spark.Response;
import spark.Route;

public class GetUserStatsHandler implements Route {

  public StorageInterface storageHandler;

  public GetUserStatsHandler(StorageInterface storageHandler) {
    this.storageHandler = storageHandler;
  }

  @Override
  public Object handle(Request request, Response response) {
    Map<String, Object> responseMap = new HashMap<>();
    try {
      String uid = request.queryParams("uid");

      if (uid == null) {
        throw new IllegalArgumentException("UID must be provided");
      }

      List<Map<String, Object>> categories = this.storageHandler.getCollection(uid, "categories");

      Map<String, Object> userProfile = new HashMap<>();
      try {
        userProfile = this.storageHandler.getDocumentData(uid, "user_data", "profile");
      } catch (Exception e) {
        // -- PROFILE DOESN'T EXIST YET
        userProfile = new HashMap<>();
      }

      responseMap.put("response_type", "success");
      responseMap.put("categories", categories);
      responseMap.put("current_category", userProfile.get("current_category"));
      responseMap.put("total_points", calculateTotalPoints(categories));

    } catch (Exception e) {
      System.err.println("Error in GetUserStatsHandler:");
      e.printStackTrace();
      responseMap.put("response_type", "failure");
      responseMap.put("error", e.getMessage());
    }

    return Utils.toMoshiJson(responseMap);
  }

  // -- GET TOTAL POINTS
  private int calculateTotalPoints(List<Map<String, Object>> categories) {
    int totalPoints = 0;
    for (Map<String, Object> category : categories) {
      if (category.containsKey("total_points")) {
        totalPoints += ((Number) category.get("total_points")).intValue();
      }
    }
    return totalPoints;
  }
}
