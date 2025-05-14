package edu.brown.cs.student.main.server.storage;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

public interface StorageInterface {

  void addDocument(String uid, String collection_id, String doc_id, Map<String, Object> data);

  List<Map<String, Object>> getCollection(String uid, String collection_id)
      throws InterruptedException, ExecutionException;

  // leaderboard methods:
  /** return top‐N users by total points across all genres. */
  List<Map<String, Object>> getGlobalLeaderboard(int limit)
      throws InterruptedException, ExecutionException;

  /**
   * return top‐N users in a dorm by total points, plus how many points they scored in that dorm’s
   * top genre.
   */
  List<Map<String, Object>> getDormLeaderboard(String dormId, int limit)
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
