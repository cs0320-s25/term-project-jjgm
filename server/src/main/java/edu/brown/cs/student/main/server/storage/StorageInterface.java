package edu.brown.cs.student.main.server.storage;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

public interface StorageInterface {

  void addDocument(String uid, String collection_id, String doc_id, Map<String, Object> data);

  List<Map<String, Object>> getCollection(String uid, String collection_id)
      throws InterruptedException, ExecutionException;

  Map<String, Object> getDocumentData(String uid, String collection_id, String doc_id)
      throws InterruptedException, ExecutionException;

  void clearUser(String uid) throws InterruptedException, ExecutionException;

  void addPin(String uid, String pinId, Map<String, Object> pinData);

  List<Map<String, Object>> getAllPins() throws InterruptedException, ExecutionException;

  void clearUserPins(String uid) throws InterruptedException, ExecutionException;

  /** returns list of leaderboard entries (rank, nickname, dorm, score) for all users. */
  List<Map<String, Object>> getGlobalLeaderboard(int limit)
      throws InterruptedException, ExecutionException;

  /**
   * returns list of leaderboard entries (rank, nickname, dorm, score) for users in a specific dorm.
   */
  List<Map<String, Object>> getDormLeaderboard(String dormId, int limit)
      throws InterruptedException, ExecutionException;

  /** sum up and return user’s total points across all categories. */
  long getTotalPoints(String uid) throws InterruptedException, ExecutionException;
}
