package edu.brown.cs.student.main.server.handlers;

import edu.brown.cs.student.main.server.storage.StorageInterface;
import java.util.HashMap;
import java.util.Map;
import spark.Request;
import spark.Response;
import spark.Route;

public class AddPinHandler implements Route {

  public StorageInterface storageHandler;

  public AddPinHandler(StorageInterface storageHandler) {
    this.storageHandler = storageHandler;
  }

  @Override
  public Object handle(Request request, Response response) {
    Map<String, Object> responseMap = new HashMap<>();
    try {
      // collect parameters from the request
      String uid = request.queryParams("uid");
      String id = request.queryParams("id");
      double lat = Double.parseDouble(request.queryParams("lat"));
      double lng = Double.parseDouble(request.queryParams("lng"));
      long timestamp = Long.parseLong(request.queryParams("timestamp"));

      Map<String, Object> data = new HashMap<>();
      data.put("id", id);
      data.put("lat", lat);
      data.put("lng", lng);
      data.put("userId", uid);
      data.put("timestamp", timestamp);

      System.out.println("adding pin with id: " + id + " for user: " + uid);

      // Use the interface method (no casting needed now)
      this.storageHandler.addPin(uid, id, data);

      responseMap.put("response_type", "success");
      responseMap.put("pin_id", id);
    } catch (Exception e) {
      // error occurred in the storage handler
      System.err.println("Error in AddPinHandler:");
      e.printStackTrace();
      responseMap.put("response_type", "failure");
      responseMap.put("error", e.getMessage());
    }

    return Utils.toMoshiJson(responseMap);
  }
}
