package edu.brown.cs.student.main.server.handlers;

import com.squareup.moshi.JsonAdapter;
import com.squareup.moshi.Moshi;
import edu.brown.cs.student.main.server.storage.StorageInterface;
import java.util.HashMap;
import java.util.Map;
import spark.Request;
import spark.Response;
import spark.Route;

public class UpdatePointsHandler implements Route {

  private final StorageInterface storageHandler;

  public UpdatePointsHandler(StorageInterface storageHandler) {
    this.storageHandler = storageHandler;
  }

  public static class PointsRequest {
    public String userId;
    public String genre;
    public int points;
  }

  @Override
  public Object handle(Request request, Response response) {
    Map<String, Object> responseMap = new HashMap<>();

    try {
      Moshi moshi = new Moshi.Builder().build();
      JsonAdapter<PointsRequest> adapter = moshi.adapter(PointsRequest.class);
      PointsRequest input = adapter.fromJson(request.body());

      if (input == null || input.userId == null || input.genre == null) {
        responseMap.put("response_type", "failure");
        responseMap.put("error", "Missing required fields");
        return Utils.toMoshiJson(responseMap);
      }

      int gamesPlayedToday = this.storageHandler.getGamesPlayedToday(input.userId);
      if (gamesPlayedToday >= 5) {
        responseMap.put("response_type", "failure");
        responseMap.put("error", "Daily game limit reached (5 games)");
        return Utils.toMoshiJson(responseMap);
      }

      this.storageHandler.recordGamePlayed(input.userId);

      this.storageHandler.updateUserPoints(input.userId, input.genre, input.points);

      responseMap.put("response_type", "success");
      responseMap.put("games_played_today", gamesPlayedToday + 1);
      responseMap.put("points_added", input.points);

      Map<String, Integer> userPoints = this.storageHandler.getUserPoints(input.userId);
      responseMap.put("total_points", userPoints);

    } catch (Exception e) {
      e.printStackTrace();
      responseMap.put("response_type", "failure");
      responseMap.put("error", e.getMessage());
    }

    return Utils.toMoshiJson(responseMap);
  }
}
