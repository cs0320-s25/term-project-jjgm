package edu.brown.cs.student.main.server.handlers;

import com.squareup.moshi.JsonAdapter;
import com.squareup.moshi.Moshi;
import edu.brown.cs.student.main.server.storage.StorageInterface;
import java.util.HashMap;
import java.util.Map;
import spark.Request;
import spark.Response;
import spark.Route;

public class GetUserPointsHandler implements Route {

  private final StorageInterface storageHandler;

  public GetUserPointsHandler(StorageInterface storageHandler) {
    this.storageHandler = storageHandler;
  }

  public static class UserPointsRequest {
    public String userId;
  }

  @Override
  public Object handle(Request request, Response response) {
    Map<String, Object> responseMap = new HashMap<>();

    try {
      Moshi moshi = new Moshi.Builder().build();
      JsonAdapter<UserPointsRequest> adapter = moshi.adapter(UserPointsRequest.class);
      UserPointsRequest input = adapter.fromJson(request.body());

      if (input == null || input.userId == null) {
        responseMap.put("response_type", "failure");
        responseMap.put("error", "Missing userId");
        return Utils.toMoshiJson(responseMap);
      }

      // Get user points
      Map<String, Integer> userPoints = this.storageHandler.getUserPoints(input.userId);

      // Get games played today
      int gamesPlayedToday = this.storageHandler.getGamesPlayedToday(input.userId);

      responseMap.put("response_type", "success");
      responseMap.put("points", userPoints);
      responseMap.put("games_played_today", gamesPlayedToday);
      responseMap.put("games_remaining_today", Math.max(0, 5 - gamesPlayedToday));

    } catch (Exception e) {
      e.printStackTrace();
      responseMap.put("response_type", "failure");
      responseMap.put("error", e.getMessage());
    }

    return Utils.toMoshiJson(responseMap);
  }
}
