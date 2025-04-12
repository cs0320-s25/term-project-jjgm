package edu.brown.cs.student.main.server.handlers;

import edu.brown.cs.student.main.server.datasource.GeoDataSource;
import edu.brown.cs.student.main.server.parser.GeoJsonObject;
import java.util.HashMap;
import java.util.Map;
import spark.Request;
import spark.Response;
import spark.Route;

public class RedLiningHandler implements Route {

  private GeoDataSource geoDataSource;

  public RedLiningHandler(GeoDataSource geoDataSource) {
    this.geoDataSource = geoDataSource;
  }

  @Override
  public Object handle(Request request, Response response) throws Exception {
    try {
      double minLat = Double.parseDouble(request.queryParams("minLat"));
      double maxLat = Double.parseDouble(request.queryParams("maxLat"));
      double minLon = Double.parseDouble(request.queryParams("minLon"));
      double maxLon = Double.parseDouble(request.queryParams("maxLon"));

      if (String.valueOf(minLat) == null
          || String.valueOf(maxLat) == null
          || String.valueOf(minLon) == null
          || String.valueOf(maxLon) == null) {
        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("response_type", "failure");
        responseMap.put("error", "All four parameters must be provided");
      }

      GeoJsonObject filteredData = geoDataSource.getFilteredData(minLat, maxLat, minLon, maxLon);
      String jsonResponse = Utils.toMoshiJson(filteredData);
      return jsonResponse;
    } catch (Exception e) {
      Map<String, Object> responseMap = new HashMap<>();
      responseMap.put("response_type", "failure");
      responseMap.put("error", e.getMessage());
      return Utils.toMoshiJson(responseMap);
    }
  }
}
