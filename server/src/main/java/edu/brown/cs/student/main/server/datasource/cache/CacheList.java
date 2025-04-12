package edu.brown.cs.student.main.server.datasource.cache;

import java.util.LinkedHashMap;
import java.util.Map;

public class CacheList<K, V> extends LinkedHashMap<K, V> {

  private int maxSize;

  public CacheList(int maxSize) {
    super(maxSize, 0.75f, true);
    this.maxSize = maxSize;
  }

  @Override
  public boolean removeEldestEntry(Map.Entry<K, V> eldest) {
    return this.size() > this.maxSize;
  }
}
