package edu.brown.cs.student.main.server.handlers;
import edu.brown.cs.student.main.server.Utils;
import edu.brown.cs.student.main.server.storage.StorageInterface;
import java.util.HashMap;
import java.util.Map;
import spark.Request;
import spark.Response;
import spark.Route;

public class GetProfileHandler implements Route{
  public StorageInterface storageHandler;

  public GetProfileHandler(StorageInterface storageHandler) {
    this.storageHandler = storageHandler;
  }

  public Object handle(Request request, Response response){
    Map<String, Object> responseMap = new HashMap<>();
    try{
      // collect parameters from the request
      String userId = request.queryParams("userId");

      if (userId == null || userId.isEmpty()) {
        responseMap.put("response_type", "failure");
        responseMap.put("error", "Missing userId parameter");
        return Utils.toMoshiJson(responseMap);
      }

      System.out.println("getting profile for user: " + userId);

      // Use the interface method
      List<Map<String, Object>> userData = this.storageHandler.getCollection(userId, "profile");

      if (userData == null || userData.isEmpty()) {
        responseMap.put("response_type", "failure");
        responseMap.put("error", "Profile not found");
      }else {
        responseMap.put("response_type", "success");
        responseMap.put("profile", userData.get(0));
      }

    } catch (Exception e) {
      // error occurred in the storage handler
      System.err.println("Error in GetProfileHandler:");
      e.printStackTrace();
      responseMap.put("response_type", "failure");
      responseMap.put("error", e.getMessage());
    }
  }
  return Utils.toMoshiJson(responseMap);
  }
}