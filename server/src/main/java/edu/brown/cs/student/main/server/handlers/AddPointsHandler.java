package edu.brown.cs.student.main.server.handlers;

import edu.brown.cs.student.main.server.storage.StorageInterface;
import java.util.HashMap;
import java.util.Map;
import spark.Request;
import spark.Response;
import spark.Route;

public class AddPointsHandler implements Route {

  public StorageInterface storageHandler;

  public AddPointsHandler(StorageInterface storageHandler) {
    this.storageHandler = storageHandler;
  }

  @Override
  public Object handle(Request request, Response response) {
    Map<String, Object> responseMap = new HashMap<>();
    try {
      String uid = request.queryParams("uid");
      String category = request.queryParams("category");
      int points = Integer.parseInt(request.queryParams("points"));

      if (uid == null || category == null) {
        throw new IllegalArgumentException("UID and category must be provided");
      }

      // -- CURRENT CATEGORY DATA
      Map<String, Object> categoryData =
          this.storageHandler.getDocumentData(uid, "categories", category);

      int totalPoints = 0;
      if (categoryData != null && categoryData.containsKey("total_points")) {
        totalPoints = ((Number) categoryData.get("total_points")).intValue();
      }

      totalPoints += points;

      Map<String, Object> updatedCategoryData = new HashMap<>();
      updatedCategoryData.put("total_points", totalPoints);
      updatedCategoryData.put("last_updated", System.currentTimeMillis());

      String pointHistoryId = "point-" + System.currentTimeMillis();
      Map<String, Object> pointHistoryData = new HashMap<>();
      pointHistoryData.put("points", points);
      pointHistoryData.put("category", category);
      pointHistoryData.put("timestamp", System.currentTimeMillis());

      this.storageHandler.addDocument(uid, "categories", category, updatedCategoryData);

      this.storageHandler.addDocument(uid, "point_history", pointHistoryId, pointHistoryData);

      // new line for atomically adding points (incrementing cumulativePoints

      this.storageHandler.incrementUserPoints(uid, points);

      responseMap.put("response_type", "success");
      responseMap.put("total_points", totalPoints);
      responseMap.put("category", category);

    } catch (Exception e) {
      System.err.println("Error in AddPointsHandler:");
      e.printStackTrace();
      responseMap.put("response_type", "failure");
      responseMap.put("error", e.getMessage());
    }

    return Utils.toMoshiJson(responseMap);
  }
}
