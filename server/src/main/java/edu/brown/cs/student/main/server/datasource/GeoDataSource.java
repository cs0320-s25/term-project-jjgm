package edu.brown.cs.student.main.server.datasource;

import edu.brown.cs.student.main.server.parser.GeoJsonObject;

public interface GeoDataSource {

  GeoJsonObject getFilteredData(double minLat, double maxLat, double minLon, double maxLon);
}
