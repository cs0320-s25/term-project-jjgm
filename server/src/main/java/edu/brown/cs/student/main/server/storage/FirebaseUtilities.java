package edu.brown.cs.student.main.server.storage;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.FieldValue;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

public class FirebaseUtilities implements StorageInterface {

  public FirebaseUtilities() throws IOException {
    String workingDirectory = System.getProperty("user.dir");
    System.out.println("Working directory: " + workingDirectory);
    Path firebaseConfigPath =
        Paths.get(workingDirectory, "src", "main", "resources", "firebase_config.json");
    System.out.println("Looking for firebase_config.json at: " + firebaseConfigPath.toString());

    FileInputStream serviceAccount = new FileInputStream(firebaseConfigPath.toString());

    FirebaseOptions options =
        new FirebaseOptions.Builder()
            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
            .build();

    System.out.println("FirebaseOptions built.");

    FirebaseApp.initializeApp(options);
  }

  @Override
  public List<Map<String, Object>> getCollection(String uid, String collection_id)
      throws InterruptedException, ExecutionException, IllegalArgumentException {
    if (uid == null || collection_id == null) {
      throw new IllegalArgumentException("getCollection: uid and/or collection_id cannot be null");
    }

    // gets all documents in the collection 'collection_id' for user 'uid'
    Firestore db = FirestoreClient.getFirestore();

    // Make the data payload to add to your collection
    CollectionReference dataRef = db.collection("users").document(uid).collection(collection_id);

    // Get documents
    QuerySnapshot dataQuery = dataRef.get().get();

    // Get data from document queries
    List<Map<String, Object>> data = new ArrayList<>();
    for (QueryDocumentSnapshot doc : dataQuery.getDocuments()) {
      data.add(doc.getData());
    }

    return data;
  }

  @Override
  public List<Map<String, Object>> getGlobalLeaderboard(int limit)
      throws InterruptedException, ExecutionException {
    Firestore db = FirestoreClient.getFirestore();

    // fetch every user profile doc:

    List<QueryDocumentSnapshot> profiles = db.collectionGroup("profile").get().get().getDocuments();

    // make nickname, dorm, score for each:

    List<Map<String, Object>> data = new ArrayList<>();
    for (QueryDocumentSnapshot doc : profiles) {
      String uid = doc.getReference().getParent().getParent().getId();
      String nickname = doc.getString("nickname");
      String dorm = doc.getString("dorm");
      Map<String, Integer> pointsMap = getUserPoints(uid);
      long total = pointsMap.values().stream().mapToLong(i -> i).sum();

      Map<String, Object> profile = new HashMap<>();
      profile.put("nickname", nickname);
      profile.put("dorm", dorm);
      profile.put("score", total);
      data.add(profile);
    }

    data.sort((a, b) -> Long.compare((Long) b.get("score"), (Long) a.get("score")));

    // assign rank to top N:

    List<Map<String, Object>> out = new ArrayList<>();

    for (int i = 0; i < Math.min(limit, data.size()); i++) {
      Map<String, Object> entry = data.get(i);
      entry.put("rank", i + 1);
      out.add(entry);
    }
    return out;
  }

  @Override
  public List<Map<String, Object>> getDormLeaderboard(String dormId, int limit)
      throws InterruptedException, ExecutionException {
    Firestore db = FirestoreClient.getFirestore();

    // determine dorm top genre:

    Map<String, Integer> dormMap = getDormPoints(dormId);
    String topGenre =
        dormMap.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse(null);

    // fetch every profile, filter by dorm:

    List<QueryDocumentSnapshot> profiles = db.collectionGroup("profile").get().get().getDocuments();

    List<Map<String, Object>> filtered = new ArrayList<>();

    for (QueryDocumentSnapshot doc : profiles) {
      String uid = doc.getReference().getParent().getParent().getId();
      String dorm = doc.getString("dorm");
      System.out.println("   profile dorm='" + dorm + "'");

      if (!dormId.equals(dorm)) continue;

      // normalizing trimmed and ignore-case:

      if (!dorm.trim().equalsIgnoreCase(dormId.trim())) continue;

      String nickname = doc.getString("nickname");
      Map<String, Integer> pointsMap = getUserPoints(uid);
      long total = pointsMap.values().stream().mapToLong(i -> i).sum();
      int contribution = topGenre == null ? pointsMap.getOrDefault(topGenre, 0) : 0;

      Map<String, Object> profile = new HashMap<>();
      profile.put("nickname", nickname);
      profile.put("dorm", dorm);
      profile.put("score", total);
      profile.put("contribution", contribution);
      filtered.add(profile);
    }

    // sort
    filtered.sort((a, b) -> Long.compare((Long) b.get("score"), (Long) a.get("score")));
    List<Map<String, Object>> out = new ArrayList<>();
    for (int i = 0; i < Math.min(limit, filtered.size()); i++) {
      Map<String, Object> entry = filtered.get(i);
      entry.put("rank", i + 1);
      out.add(entry);
    }
    return out;
  }

  @Override
  public void addDocument(String uid, String collection_id, String doc_id, Map<String, Object> data)
      throws IllegalArgumentException {
    if (uid == null || collection_id == null || doc_id == null || data == null) {
      throw new IllegalArgumentException(
          "addDocument: uid, collection_id, doc_id, or data cannot be null");
    }

    // adds a new document to collection for user with data payload
    Firestore db = FirestoreClient.getFirestore();
    db.collection("users").document(uid).collection(collection_id).document(doc_id).set(data);
  }

  // --------- Points System Implementation ---------

  @Override
  public void updateUserPoints(String userId, String genre, int pointsToAdd)
      throws InterruptedException, ExecutionException {
    if (userId == null || genre == null) {
      throw new IllegalArgumentException("updateUserPoints: userId and genre cannot be null");
    }

    Firestore db = FirestoreClient.getFirestore();
    DocumentReference pointsDocRef =
        db.collection("users").document(userId).collection("points").document("genrePoints");

    // -- first get user's profile to determine dorm
    DocumentReference profileDocRef =
        db.collection("users").document(userId).collection("profile").document(userId);
    DocumentSnapshot profileDoc = profileDocRef.get().get();

    String dorm = null;
    if (profileDoc.exists() && profileDoc.contains("dorm")) {
      dorm = profileDoc.getString("dorm");
    }

    // -- get current points document if it exists
    DocumentSnapshot pointsDoc = pointsDocRef.get().get();

    if (pointsDoc.exists()) {
      // -- update existing points document
      Map<String, Object> updates = new HashMap<>();
      updates.put(genre, FieldValue.increment(pointsToAdd));
      pointsDocRef.update(updates);

      System.out.println(
          "Updated user " + userId + " points for genre " + genre + " by adding " + pointsToAdd);
    } else {
      // -- create new points document
      Map<String, Object> points = new HashMap<>();
      points.put(genre, pointsToAdd);
      pointsDocRef.set(points);

      System.out.println(
          "Created new points record for user "
              + userId
              + " with "
              + pointsToAdd
              + " points in "
              + genre);
    }

    // -- ff dorm info is available, update dorm points too
    if (dorm != null && !dorm.isEmpty()) {
      updateDormPoints(dorm, genre, pointsToAdd);
    }
  }

  @Override
  public Map<String, Integer> getUserPoints(String userId)
      throws InterruptedException, ExecutionException {
    if (userId == null) {
      throw new IllegalArgumentException("getUserPoints: userId cannot be null");
    }

    Firestore db = FirestoreClient.getFirestore();
    DocumentReference pointsDocRef =
        db.collection("users").document(userId).collection("points").document("genrePoints");

    // -- get the points document
    DocumentSnapshot pointsDoc = pointsDocRef.get().get();

    Map<String, Integer> result = new HashMap<>();
    if (pointsDoc.exists()) {
      // -- Long values to Integer
      Map<String, Object> data = pointsDoc.getData();
      for (Map.Entry<String, Object> entry : data.entrySet()) {
        if (entry.getValue() instanceof Long) {
          result.put(entry.getKey(), ((Long) entry.getValue()).intValue());
        } else if (entry.getValue() instanceof Integer) {
          result.put(entry.getKey(), (Integer) entry.getValue());
        }
      }
    }

    return result;
  }

  @Override
  public void updateDormPoints(String dorm, String genre, int pointsToAdd)
      throws InterruptedException, ExecutionException {
    if (dorm == null || genre == null) {
      throw new IllegalArgumentException("updateDormPoints: dorm and genre cannot be null");
    }

    Firestore db = FirestoreClient.getFirestore();
    DocumentReference dormDocRef = db.collection("dorms").document(dorm);

    // -- get current dorm document if it exists
    DocumentSnapshot dormDoc = dormDocRef.get().get();

    if (dormDoc.exists()) {
      // -- update existing dorm document
      Map<String, Object> updates = new HashMap<>();
      updates.put(genre, FieldValue.increment(pointsToAdd));
      dormDocRef.update(updates);

      System.out.println(
          "Updated dorm " + dorm + " points for genre " + genre + " by adding " + pointsToAdd);
    } else {
      // -- create new dorm document
      Map<String, Object> points = new HashMap<>();
      points.put(genre, pointsToAdd);
      dormDocRef.set(points);

      System.out.println(
          "Created new points record for dorm "
              + dorm
              + " with "
              + pointsToAdd
              + " points in "
              + genre);
    }
  }

  @Override
  public Map<String, Integer> getDormPoints(String dorm)
      throws InterruptedException, ExecutionException {
    if (dorm == null) {
      throw new IllegalArgumentException("getDormPoints: dorm cannot be null");
    }

    Firestore db = FirestoreClient.getFirestore();
    DocumentReference dormDocRef = db.collection("dorms").document(dorm);

    // -- get the dorm document
    DocumentSnapshot dormDoc = dormDocRef.get().get();

    Map<String, Integer> result = new HashMap<>();
    if (dormDoc.exists()) {
      Map<String, Object> data = dormDoc.getData();
      for (Map.Entry<String, Object> entry : data.entrySet()) {
        if (entry.getValue() instanceof Long) {
          result.put(entry.getKey(), ((Long) entry.getValue()).intValue());
        } else if (entry.getValue() instanceof Integer) {
          result.put(entry.getKey(), (Integer) entry.getValue());
        }
      }
    }

    return result;
  }

  @Override
  public void recordGamePlayed(String userId) throws InterruptedException, ExecutionException {
    if (userId == null) {
      throw new IllegalArgumentException("recordGamePlayed: userId cannot be null");
    }

    Firestore db = FirestoreClient.getFirestore();
    String today = LocalDate.now().toString(); // Format: YYYY-MM-DD

    DocumentReference dailyGamesRef =
        db.collection("users").document(userId).collection("dailyGames").document(today);

    // -- get current count if it exists
    DocumentSnapshot dailyGamesDoc = dailyGamesRef.get().get();

    if (dailyGamesDoc.exists()) {
      // -- update existing counter
      Long count = dailyGamesDoc.getLong("count");
      if (count == null) {
        count = 0L;
      }
      dailyGamesRef.update("count", count + 1);

      System.out.println("User " + userId + " has now played " + (count + 1) + " games today");
    } else {
      // -- create new counter
      Map<String, Object> data = new HashMap<>();
      data.put("count", 1);
      dailyGamesRef.set(data);

      System.out.println("User " + userId + " played their first game today");
    }
  }

  @Override
  public int getGamesPlayedToday(String userId) throws InterruptedException, ExecutionException {
    if (userId == null) {
      throw new IllegalArgumentException("getGamesPlayedToday: userId cannot be null");
    }

    Firestore db = FirestoreClient.getFirestore();
    String today = LocalDate.now().toString(); // Format: YYYY-MM-DD

    DocumentReference dailyGamesRef =
        db.collection("users").document(userId).collection("dailyGames").document(today);

    // -- get current count if it exists
    DocumentSnapshot dailyGamesDoc = dailyGamesRef.get().get();

    if (dailyGamesDoc.exists() && dailyGamesDoc.contains("count")) {
      Long count = dailyGamesDoc.getLong("count");
      return count != null ? count.intValue() : 0;
    }

    return 0; // -- no games played today
  }
}
