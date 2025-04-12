package edu.brown.cs.student.main.server.datasource;

import edu.brown.cs.student.main.server.parser.GeoJsonObject;
import java.util.ArrayList;
import java.util.List;

public class DefaultDataSource implements GeoDataSource {

  private final GeoJsonObject data;

  public DefaultDataSource(GeoJsonObject data) {
    this.data = data;
  }

  @Override
  public GeoJsonObject getFilteredData(double minLat, double maxLat, double minLon, double maxLon) {
    ArrayList<GeoJsonObject.Feature> featureList = new ArrayList<>();
    for (GeoJsonObject.Feature feature : this.data.features) {
      if (isWithinBounds(feature, minLat, maxLat, minLon, maxLon)) {
        featureList.add(feature);
      }
    }

    GeoJsonObject geoJsonObject = new GeoJsonObject();
    geoJsonObject.type = "FeatureCollection";
    geoJsonObject.features = featureList;
    return geoJsonObject;
  }

  public boolean isWithinBounds(
      GeoJsonObject.Feature feature, double minLat, double maxLat, double minLon, double maxLon) {

    if (feature == null || feature.geometry == null || feature.geometry.coordinates == null) {
      return false;
    }

    double featureMaxLat = -91;
    double featureMinLat = 91;
    double featureMaxLon = -181;
    double featureMinLon = 181;

    for (List<List<List<Double>>> polygon : feature.geometry.coordinates) {
      for (List<List<Double>> line : polygon) {
        for (List<Double> coordinates : line) {
          double lon = coordinates.get(0);
          double lat = coordinates.get(1);

          if (featureMaxLat < lat) featureMaxLat = lat;
          if (featureMinLat > lat) featureMinLat = lat;
          if (featureMaxLon < lon) featureMaxLon = lon;
          if (featureMinLon > lon) featureMinLon = lon;
        }
      }
    }
    return (featureMaxLat <= maxLat
        && featureMinLat >= minLat
        && featureMaxLon <= maxLon
        && featureMinLon >= minLon);
  }
}
