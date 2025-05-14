package edu.brown.cs.student.main.server.handlers;

import com.squareup.moshi.JsonAdapter;
import com.squareup.moshi.Moshi;
import edu.brown.cs.student.main.server.storage.StorageInterface;
import java.util.HashMap;
import java.util.Map;
import spark.Request;
import spark.Response;
import spark.Route;

public class GetDormPointsHandler implements Route {

  private final StorageInterface storageHandler;

  public GetDormPointsHandler(StorageInterface storageHandler) {
    this.storageHandler = storageHandler;
  }

  public static class DormPointsRequest {
    public String dorm;
  }

  @Override
  public Object handle(Request request, Response response) {
    Map<String, Object> responseMap = new HashMap<>();

    try {
      Moshi moshi = new Moshi.Builder().build();
      JsonAdapter<DormPointsRequest> adapter = moshi.adapter(DormPointsRequest.class);
      DormPointsRequest input = adapter.fromJson(request.body());

      if (input == null || input.dorm == null) {
        responseMap.put("response_type", "failure");
        responseMap.put("error", "Missing dorm name");
        return Utils.toMoshiJson(responseMap);
      }

      Map<String, Integer> dormPoints = this.storageHandler.getDormPoints(input.dorm);

      responseMap.put("response_type", "success");
      responseMap.put("dorm", input.dorm);
      responseMap.put("points", dormPoints);

    } catch (Exception e) {
      e.printStackTrace();
      responseMap.put("response_type", "failure");
      responseMap.put("error", e.getMessage());
    }

    return Utils.toMoshiJson(responseMap);
  }
}
