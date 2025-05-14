package edu.brown.cs.student.main.server.handlers;

import edu.brown.cs.student.main.server.storage.StorageInterface;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import spark.Request;
import spark.Response;
import spark.Route;

public class LeaderboardGlobalhandler implements Route {
  private final StorageInterface storage;

  public LeaderboardGlobalhandler(StorageInterface storage) {
    this.storage = storage;
  }

  @Override
  public Object handle(Request request, Response response) throws Exception {

    Map<String, Object> responseMap = new HashMap<>();

    try {
      List<Map<String, Object>> entries = storage.getGlobalLeaderboard(10);
      responseMap.put("response_type", "success");
      responseMap.put("entries", entries);
    } catch (Exception e) {
      e.printStackTrace();
      responseMap.put("response_type", "error");
      responseMap.put("message", e.getMessage());
    }

    return Utils.toMoshiJson(responseMap);
  }
}
