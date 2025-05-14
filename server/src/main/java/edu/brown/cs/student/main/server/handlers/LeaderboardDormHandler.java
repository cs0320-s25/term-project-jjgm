package edu.brown.cs.student.main.server.handlers;

import edu.brown.cs.student.main.server.storage.StorageInterface;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import spark.Request;
import spark.Response;
import spark.Route;

public class LeaderboardDormHandler implements Route {
  private final StorageInterface storage;

  public LeaderboardDormHandler(StorageInterface storage) {
    this.storage = storage;
  }

  @Override
  public Object handle(Request request, Response response) throws Exception {
    Map<String, Object> responseMap = new HashMap<>();

    // for debugging
    System.out.println(">> URL       = " + request.url());
    System.out.println(">> URI       = " + request.uri());
    System.out.println(">> pathInfo  = " + request.pathInfo());
    System.out.println(">> paramsAll = " + request.params());

    try {
      String dormId = request.queryParams(":dormId");

      if (dormId == null) {
        dormId = request.params(":dormid");
      }
      // System.out.println(">> LeaderboardDormHandler for dormId = " + dormId);

      if (dormId == null || dormId.isEmpty()) {
        throw new IllegalArgumentException("dormId path parameter is missing");
      }

      List<Map<String, Object>> entries = storage.getDormLeaderboard(dormId, 10);
      // System.out.println(">> returned " + entries.size() + " entries");
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
