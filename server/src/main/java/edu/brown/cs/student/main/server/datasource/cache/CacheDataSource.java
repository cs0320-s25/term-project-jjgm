package edu.brown.cs.student.main.server.datasource.cache;

import edu.brown.cs.student.main.server.datasource.GeoDataSource;
import edu.brown.cs.student.main.server.parser.GeoJsonObject;
import java.util.LinkedHashMap;

public class CacheDataSource implements GeoDataSource {

  private int maxSize;

  private GeoDataSource defaulDataSource;

  private LinkedHashMap<String, GeoJsonObject> cache;

  public CacheDataSource(GeoDataSource defaulDataSource, int maxSize) {
    this.maxSize = maxSize;
    this.defaulDataSource = defaulDataSource;
    this.cache = new CacheList<>(this.maxSize);
  }

  @Override
  public GeoJsonObject getFilteredData(double minLat, double maxLat, double minLon, double maxLon) {
    String cacheKey = createCacheKey(minLat, maxLat, minLon, maxLon);
    if (this.cache.containsKey(cacheKey)) {
      return cache.get(cacheKey);
    }
    GeoJsonObject data = this.defaulDataSource.getFilteredData(minLat, maxLat, minLon, maxLon);
    this.cache.put(cacheKey, data);
    return data;
  }

  private String createCacheKey(double minLat, double maxLat, double minLon, double maxLon) {
    return minLat + "_" + maxLat + "_" + minLon + "_" + maxLon;
  }
}
