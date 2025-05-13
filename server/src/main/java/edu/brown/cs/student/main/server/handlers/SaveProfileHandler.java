package edu.brown.cs.student.main.server.handlers;

import com.squareup.moshi.JsonAdapter;
import com.squareup.moshi.Moshi;
import edu.brown.cs.student.main.server.storage.StorageInterface;
import java.util.HashMap;
import java.util.Map;
import spark.Request;
import spark.Response;
import spark.Route;

public class SaveProfileHandler implements Route {

  private final StorageInterface storageHandler;

  public SaveProfileHandler(StorageInterface storageHandler) {
    this.storageHandler = storageHandler;
  }

  public static class ProfileInput {
    public String userId;
    public String nickname;
    public String dorm;
  }

  @Override
  public Object handle(Request request, Response response) {
    Map<String, Object> responseMap = new HashMap<>();

    try {
      Moshi moshi = new Moshi.Builder().build();
      JsonAdapter<ProfileInput> adapter = moshi.adapter(ProfileInput.class);
      ProfileInput input = adapter.fromJson(request.body());

      if (input == null || input.userId == null || input.nickname == null || input.dorm == null) {
        responseMap.put("response_type", "failure");
        responseMap.put("error", "Missing required fields.");
        return Utils.toMoshiJson(responseMap);
      }

      Map<String, Object> profile = new HashMap<>();
      profile.put("nickname", input.nickname);
      profile.put("dorm", input.dorm);
      // new -- trying to add points to profile as to not have loops in place:
      profile.put("cumulativePoints", 0L);

      storageHandler.addDocument(input.userId, "profile", input.userId, profile);

      responseMap.put("response_type", "success");
      responseMap.put("profile", profile);
      return Utils.toMoshiJson(responseMap);

    } catch (Exception e) {
      e.printStackTrace();
      responseMap.put("response_type", "failure");
      responseMap.put("error", e.getMessage());
      return Utils.toMoshiJson(responseMap);
    }
  }
}
