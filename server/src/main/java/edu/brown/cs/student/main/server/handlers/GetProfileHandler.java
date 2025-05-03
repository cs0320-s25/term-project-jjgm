package edu.brown.cs.student.main.server.handlers;

import com.squareup.moshi.JsonAdapter;
import com.squareup.moshi.Moshi;
import edu.brown.cs.student.main.server.storage.StorageInterface;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import spark.Request;
import spark.Response;
import spark.Route;

public class GetProfileHandler implements Route {

  private final StorageInterface storageHandler;

  public GetProfileHandler(StorageInterface storageHandler) {
    this.storageHandler = storageHandler;
  }

  public static class ProfileRequest {
    public String userId;
  }

  @Override
  public Object handle(Request request, Response response) {
    Map<String, Object> responseMap = new HashMap<>();

    try {
      Moshi moshi = new Moshi.Builder().build();
      JsonAdapter<ProfileRequest> adapter = moshi.adapter(ProfileRequest.class);
      ProfileRequest input = adapter.fromJson(request.body());

      if (input == null || input.userId == null || input.userId.isEmpty()) {
        responseMap.put("response_type", "failure");
        responseMap.put("error", "Missing userId");
        return Utils.toMoshiJson(responseMap);
      }

      List<Map<String, Object>> data = this.storageHandler.getCollection(input.userId, "profile");

      if (data == null || data.isEmpty()) {
        responseMap.put("response_type", "failure");
        responseMap.put("error", "Profile not found");
      } else {
        Map<String, Object> profile = data.get(0);

        Object nicknameObj = profile.get("nickname");
        Object dormObj = profile.get("dorm");

        if (nicknameObj instanceof String && dormObj instanceof String) {
          String nickname = ((String) nicknameObj).trim();
          String dorm = ((String) dormObj).trim();

          if (!nickname.isEmpty() && !dorm.isEmpty()) {
            responseMap.put("response_type", "success");
            responseMap.put("profile", profile);
          } else {
            responseMap.put("response_type", "failure");
            responseMap.put("error", "Incomplete profile");
          }
        } else {
          responseMap.put("response_type", "failure");
          responseMap.put("error", "Malformed profile data");
        }
      }

    } catch (Exception e) {
      e.printStackTrace();
      responseMap.put("response_type", "failure");
      responseMap.put("error", e.getMessage());
    }

    return Utils.toMoshiJson(responseMap);
  }
}
