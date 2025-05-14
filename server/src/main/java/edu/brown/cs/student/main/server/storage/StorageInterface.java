package edu.brown.cs.student.main.server.storage;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

public interface StorageInterface {

  void addDocument(String uid, String collection_id, String doc_id, Map<String, Object> data);

  List<Map<String, Object>> getCollection(String uid, String collection_id)
      throws InterruptedException, ExecutionException;

  // -- METHODS FOR POINTS SYSTEM

  void updateUserPoints(String userId, String genre, int pointsToAdd)
      throws InterruptedException, ExecutionException;

  Map<String, Integer> getUserPoints(String userId) throws InterruptedException, ExecutionException;

  void updateDormPoints(String dorm, String genre, int pointsToAdd)
      throws InterruptedException, ExecutionException;

  Map<String, Integer> getDormPoints(String dorm) throws InterruptedException, ExecutionException;

  void recordGamePlayed(String userId) throws InterruptedException, ExecutionException;

  int getGamesPlayedToday(String userId) throws InterruptedException, ExecutionException;
}
