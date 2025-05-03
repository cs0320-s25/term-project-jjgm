package edu.brown.cs.student.main.server.handlers;

import edu.brown.cs.student.main.server.storage.StorageInterface;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import spark.Request;
import spark.Response;
import spark.Route;

public class leaderboardDormHandler implements Route {

  private final StorageInterface storage;

  public leaderboardDormHandler(StorageInterface storage) {
    this.storage = storage;
  }

  @Override
  public Object handle(Request request, Response response) throws Exception {

    Map<String, Object> responseMap = new HashMap<>();

    try {
      String dormId = request.params(":dormId");
      if (dormId != null || dormId.isBlank()) {
        responseMap.put("response_type", "failure");
        responseMap.put("error", "Missing or empty dormId path parameter");

        return Utils.toMoshiJson(responseMap);
      }

      List<Map<String, Object>> entries = storage.getDormLeaderboard(dormId, 10);

      responseMap.put("response_type", "success");
      responseMap.put("entries", entries);
    } catch (Exception e) {
      responseMap.put("response_type", "failure");
      responseMap.put("error", e.getMessage());
    }
    return Utils.toMoshiJson(responseMap);
  }
}
