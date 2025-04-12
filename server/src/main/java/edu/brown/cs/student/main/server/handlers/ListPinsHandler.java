package edu.brown.cs.student.main.server.handlers;

import edu.brown.cs.student.main.server.storage.FirebaseUtilities;
import edu.brown.cs.student.main.server.storage.StorageInterface;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import spark.Request;
import spark.Response;
import spark.Route;

public class ListPinsHandler implements Route {

  public StorageInterface storageHandler;

  public ListPinsHandler(StorageInterface storageHandler) {
    this.storageHandler = storageHandler;
  }

  @Override
  public Object handle(Request request, Response response) {
    Map<String, Object> responseMap = new HashMap<>();
    try {
      // cast to FirebaseUtilities to use the getAllPins method
      List<Map<String, Object>> pins = ((FirebaseUtilities) this.storageHandler).getAllPins();

      System.out.println("Found " + pins.size() + " pins to return");
      for (Map<String, Object> pin : pins) {
        System.out.println("Pin: " + pin);
      }

      responseMap.put("response_type", "success");
      responseMap.put("pins", pins);
    } catch (Exception e) {
      System.err.println("Error in ListPinsHandler:");

      // error likely occurred in the storage handler
      e.printStackTrace();
      responseMap.put("response_type", "failure");
      responseMap.put("error", e.getMessage());
    }

    return Utils.toMoshiJson(responseMap);
  }
}
