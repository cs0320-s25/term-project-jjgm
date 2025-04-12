package edu.brown.cs.student.main.server.handlers;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import spark.Request;
import spark.Response;
import spark.Route;

public class SearchAreasHandler implements Route {
  private String geoJsonPath;

  public SearchAreasHandler(String geoJsonPath) {
    this.geoJsonPath = geoJsonPath;
  }

  @Override
  public Object handle(Request request, Response response) {
    Map<String, Object> responseMap = new HashMap<>();

    try {
      // search keyword from the request
      String keyword = request.queryParams("keyword");
      keyword = keyword.toLowerCase();

      if (keyword == null || keyword.isEmpty()) {
        responseMap.put("response_type", "failure");
        responseMap.put("error", "Search keyword is required");
        return Utils.toMoshiJson(responseMap);
      }

      System.out.println("Searching for areas with keyword: " + keyword);

      String content = new String(Files.readAllBytes(Paths.get(this.geoJsonPath)));
      JsonObject geoJson = JsonParser.parseString(content).getAsJsonObject();
      JsonArray features = geoJson.getAsJsonArray("features");

      System.out.println("Loaded " + features.size() + " features from GeoJSON file");

      List<String> matchingIds = new ArrayList<>();

      // search all property fields
      for (JsonElement feature : features) {
        JsonObject featureObj = feature.getAsJsonObject();
        JsonObject properties = featureObj.getAsJsonObject("properties");

        boolean found = false;

        for (Map.Entry<String, JsonElement> entry : properties.entrySet()) {
          JsonElement value = entry.getValue();
          if (value.isJsonPrimitive() && value.getAsJsonPrimitive().isString()) {
            String strValue = value.getAsString().toLowerCase();
            if (strValue.contains(keyword)) {
              found = true;
              break;
            }
          }
        }

        // also check if the keyword matches boolean property names (like "residential")
        if (!found
            && properties.has(keyword)
            && properties.get(keyword).isJsonPrimitive()
            && properties.get(keyword).getAsBoolean()) {
          found = true;
        }

        if (found) {
          String id = properties.has("area_id") ? properties.get("area_id").getAsString() : "";

          if (!id.isEmpty()) {
            matchingIds.add(id);
          }
        }
      }

      System.out.println("Found " + matchingIds.size() + " matching areas");

      responseMap.put("response_type", "success");
      responseMap.put("matching_ids", matchingIds);
    } catch (Exception e) {
      System.err.println("Error in SearchAreasHandler:");
      e.printStackTrace();
      responseMap.put("response_type", "failure");
      responseMap.put("error", e.getMessage());
    }

    return Utils.toMoshiJson(responseMap);
  }
}
