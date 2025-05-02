import edu.brown.cs.student.main.server.storage.StorageInterface;
import java.util.HashMap;
import java.util.Map;
import spark.Request;
import spark.Response;
import spark.Route;

public class SaveProfileHandler implements Route {

  public StorageInterface storageHandler;

  public SaveProfileHandler(StorageInterface storageHandler) {
    this.storageHandler = storageHandler;
  }

  @Override
  public Object handle(Request request, Response response) {
    Map<String, Object> responseMap = new HashMap<>();
    try {
      // collect parameters from the request
      String userId = request.queryParams("userId");
      String nickName = request.queryParams("nickName");
      String dorm = request.queryParams("dorm");

      if (userId == null || nickName == null || dorm == null|| userId.isEmpty() || nickName.isEmpty()
          || dorm.isEmpty()) {
        respomseMap.put("response_type", "failure");
        responseMap.put("error", "Missing required parameters");
        return Utils.toMoshiJson(responseMap);
      }

      Map<String, Object> userData = new HashMap<>();
      data.put("nickName", nickName);
      data.put("dorm", dorm);


      System.out.println("saving profile for user: " + userId);

      // Use the interface method (no casting needed now)
      this.storageHandler.addDocument("users", userId, userData);

      responseMap.put("response_type", "success");
      responseMap.put( "profile", userData);
    } catch (Exception e) {
      // error occurred in the storage handler
      System.err.println("Error in SaveProfileHandler:");
      e.printStackTrace();
      responseMap.put("response_type", "failure");
      responseMap.put("error", e.getMessage());
    }

    return Utils.toMoshiJson(responseMap);
  }